import "@stdlib/deploy";

message(1) CreateProposal {
    description: String;
    duration: Int as uint32;
}

message(2) Vote {
    proposalId: Int as uint32;
    support: Bool;
    power: Int as uint32;
}

message(3) ExecuteProposal {
    proposalId: Int as uint32;
}

message(5) WithdrawVotingPower {
    amount: Int as uint32;
}

message(0x7362d09c) JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Cell?;
}

struct Proposal {
    id: Int as uint32;
    description: String;
    votesFor: Int as uint64;
    votesAgainst: Int as uint64;
    deadline: Int as uint32;
    executed: Bool;
    proposer: Address;
}

contract FpDao with Deployable {

    jettonMaster: Address;

    proposals: map<Int, Proposal>;
    proposalCount: Int as uint32;

    voted: map<Int, Bool>;

    votingPower: map<Int, Int>;
    deposits: map<Int, Int>;

    version: Int as uint32;

    init(jettonMaster: Address, version: Int) {
        self.jettonMaster  = jettonMaster;
        self.proposalCount = 0;
        self.proposals     = emptyMap();
        self.voted         = emptyMap();
        self.votingPower   = emptyMap();
        self.deposits      = emptyMap();
        self.version       = version;
    }

    receive() {}
    receive(msg: String) {}

    // ===============================
    // Deposit Jetton → Voting Power
    // ===============================

    receive(msg: JettonTransferNotification) {

        let user: Address = msg.sender;

        let addrInt: Int = user.asSlice().loadUint(256);

        // jetton decimals = 9
        let amount: Int = msg.amount / 1000000000;

        let currentVP: Int? = self.votingPower.get(addrInt);
        if (currentVP == null) {
            self.votingPower.set(addrInt, amount);
        } else {
            self.votingPower.set(addrInt, currentVP!! + amount);
        }

        let currentDep: Int? = self.deposits.get(addrInt);
        if (currentDep == null) {
            self.deposits.set(addrInt, amount);
        } else {
            self.deposits.set(addrInt, currentDep!! + amount);
        }
    }

    // ===============================
    // Withdraw voting power
    // ===============================

    receive(msg: WithdrawVotingPower) {

        let addrInt: Int = sender().asSlice().loadUint(256);

        let currentVP: Int? = self.votingPower.get(addrInt);
        let currentDep: Int? = self.deposits.get(addrInt);

        require(currentDep != null && currentDep!! >= msg.amount, "Insufficient deposit");
        require(currentVP != null && currentVP!! >= msg.amount, "Insufficient voting power");

        self.votingPower.set(addrInt, currentVP!! - msg.amount);
        self.deposits.set(addrInt, currentDep!! - msg.amount);

        send(SendParameters{
            to: self.jettonMaster,
            value: ton("0.1"),
            bounce: true,
            body: beginCell()
                .storeUint(0x84cc682d, 32)
                .storeUint(0, 64)
                .storeCoins(msg.amount * 1000000000)
                .storeAddress(sender())
                .storeAddress(sender())
                .storeBit(false)
                .storeCoins(0)
                .storeBit(false)
                .endCell()
        });
    }

    // ===============================
    // Create proposal
    // ===============================

    receive(msg: CreateProposal) {

        require(msg.duration >= 60, "Duration must be >= 60 seconds");
        require(msg.description != "", "Description cannot be empty");

        let addrInt: Int = sender().asSlice().loadUint(256);

        let power: Int? = self.votingPower.get(addrInt);
        require(power != null && power!! > 0, "Must have voting power");

        let id: Int = self.proposalCount;

        let deadline: Int = now() + msg.duration;

        self.proposals.set(id, Proposal{
            id: id,
            description: msg.description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: deadline,
            executed: false,
            proposer: sender()
        });

        self.proposalCount = self.proposalCount + 1;

        self.reply("Proposal created".asComment());
    }

    // ===============================
    // Vote
    // ===============================

    receive(msg: Vote) {

        require(msg.proposalId < self.proposalCount, "Proposal not found");
        require(msg.power > 0, "Power must be positive");

        let p: Proposal = self.proposals.get(msg.proposalId)!!;

        require(now() < p.deadline, "Voting ended");

        let addrInt: Int = sender().asSlice().loadUint(256);

        let voteKey: Int = msg.proposalId * 1000000000 + addrInt % 1000000000;

        let alreadyVoted: Bool? = self.voted.get(voteKey);
        require(alreadyVoted == null || alreadyVoted!! == false, "Already voted");

        let power: Int? = self.votingPower.get(addrInt);
        require(power != null && power!! >= msg.power, "Insufficient voting power");

        self.votingPower.set(addrInt, power!! - msg.power);

        self.voted.set(voteKey, true);

        if (msg.support) {
            p.votesFor = p.votesFor + msg.power;
        } else {
            p.votesAgainst = p.votesAgainst + msg.power;
        }

        self.proposals.set(msg.proposalId, p);

        self.reply("Vote counted".asComment());
    }

    // ===============================
    // Execute proposal
    // ===============================

    receive(msg: ExecuteProposal) {

        require(msg.proposalId < self.proposalCount, "Proposal not found");

        let p: Proposal = self.proposals.get(msg.proposalId)!!;

        require(now() >= p.deadline, "Voting active");
        require(!p.executed, "Already executed");

        p.executed = true;

        self.proposals.set(msg.proposalId, p);

        self.reply("Proposal executed".asComment());
    }

    // ===============================
    // Getters
    // ===============================

    get fun getProposal(id: Int): Proposal? {
        return self.proposals.get(id);
    }

    get fun getProposalCount(): Int {
        return self.proposalCount;
    }

    get fun getJettonMaster(): Address {
        return self.jettonMaster;
    }

    get fun getVotingPower(voter: Address): Int {

        let addrInt: Int = voter.asSlice().loadUint(256);

        let power: Int? = self.votingPower.get(addrInt);

        if (power == null) {
            return 0;
        }

        return power!!;
    }

    get fun getDeposit(voter: Address): Int {

        let addrInt: Int = voter.asSlice().loadUint(256);

        let dep: Int? = self.deposits.get(addrInt);

        if (dep == null) {
            return 0;
        }

        return dep!!;
    }
}

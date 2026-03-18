import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type CreateProposal = {
    $$type: 'CreateProposal';
    description: string;
    duration: bigint;
}

export function storeCreateProposal(src: CreateProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1, 32);
        b_0.storeStringRefTail(src.description);
        b_0.storeUint(src.duration, 32);
    };
}

export function loadCreateProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1) { throw Error('Invalid prefix'); }
    const _description = sc_0.loadStringRefTail();
    const _duration = sc_0.loadUintBig(32);
    return { $$type: 'CreateProposal' as const, description: _description, duration: _duration };
}

export function loadTupleCreateProposal(source: TupleReader) {
    const _description = source.readString();
    const _duration = source.readBigNumber();
    return { $$type: 'CreateProposal' as const, description: _description, duration: _duration };
}

export function loadGetterTupleCreateProposal(source: TupleReader) {
    const _description = source.readString();
    const _duration = source.readBigNumber();
    return { $$type: 'CreateProposal' as const, description: _description, duration: _duration };
}

export function storeTupleCreateProposal(source: CreateProposal) {
    const builder = new TupleBuilder();
    builder.writeString(source.description);
    builder.writeNumber(source.duration);
    return builder.build();
}

export function dictValueParserCreateProposal(): DictionaryValue<CreateProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateProposal(src)).endCell());
        },
        parse: (src) => {
            return loadCreateProposal(src.loadRef().beginParse());
        }
    }
}

export type Vote = {
    $$type: 'Vote';
    proposalId: bigint;
    support: boolean;
}

export function storeVote(src: Vote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2, 32);
        b_0.storeUint(src.proposalId, 32);
        b_0.storeBit(src.support);
    };
}

export function loadVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(32);
    const _support = sc_0.loadBit();
    return { $$type: 'Vote' as const, proposalId: _proposalId, support: _support };
}

export function loadTupleVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'Vote' as const, proposalId: _proposalId, support: _support };
}

export function loadGetterTupleVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'Vote' as const, proposalId: _proposalId, support: _support };
}

export function storeTupleVote(source: Vote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    return builder.build();
}

export function dictValueParserVote(): DictionaryValue<Vote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVote(src)).endCell());
        },
        parse: (src) => {
            return loadVote(src.loadRef().beginParse());
        }
    }
}

export type ExecuteProposal = {
    $$type: 'ExecuteProposal';
    proposalId: bigint;
}

export function storeExecuteProposal(src: ExecuteProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3, 32);
        b_0.storeUint(src.proposalId, 32);
    };
}

export function loadExecuteProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(32);
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadGetterTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function storeTupleExecuteProposal(source: ExecuteProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    return builder.build();
}

export function dictValueParserExecuteProposal(): DictionaryValue<ExecuteProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeExecuteProposal(src)).endCell());
        },
        parse: (src) => {
            return loadExecuteProposal(src.loadRef().beginParse());
        }
    }
}

export type Proposal = {
    $$type: 'Proposal';
    id: bigint;
    description: string;
    votesFor: bigint;
    votesAgainst: bigint;
    deadline: bigint;
    executed: boolean;
    proposer: Address;
}

export function storeProposal(src: Proposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.id, 32);
        b_0.storeStringRefTail(src.description);
        b_0.storeUint(src.votesFor, 32);
        b_0.storeUint(src.votesAgainst, 32);
        b_0.storeUint(src.deadline, 32);
        b_0.storeBit(src.executed);
        b_0.storeAddress(src.proposer);
    };
}

export function loadProposal(slice: Slice) {
    const sc_0 = slice;
    const _id = sc_0.loadUintBig(32);
    const _description = sc_0.loadStringRefTail();
    const _votesFor = sc_0.loadUintBig(32);
    const _votesAgainst = sc_0.loadUintBig(32);
    const _deadline = sc_0.loadUintBig(32);
    const _executed = sc_0.loadBit();
    const _proposer = sc_0.loadAddress();
    return { $$type: 'Proposal' as const, id: _id, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed, proposer: _proposer };
}

export function loadTupleProposal(source: TupleReader) {
    const _id = source.readBigNumber();
    const _description = source.readString();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    const _proposer = source.readAddress();
    return { $$type: 'Proposal' as const, id: _id, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed, proposer: _proposer };
}

export function loadGetterTupleProposal(source: TupleReader) {
    const _id = source.readBigNumber();
    const _description = source.readString();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    const _proposer = source.readAddress();
    return { $$type: 'Proposal' as const, id: _id, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed, proposer: _proposer };
}

export function storeTupleProposal(source: Proposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeString(source.description);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.deadline);
    builder.writeBoolean(source.executed);
    builder.writeAddress(source.proposer);
    return builder.build();
}

export function dictValueParserProposal(): DictionaryValue<Proposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposal(src)).endCell());
        },
        parse: (src) => {
            return loadProposal(src.loadRef().beginParse());
        }
    }
}

export type FpDao$Data = {
    $$type: 'FpDao$Data';
    jettonMaster: Address;
    proposals: Dictionary<number, Proposal>;
    proposalCount: bigint;
    voted: Dictionary<bigint, boolean>;
    version: bigint;
}

export function storeFpDao$Data(src: FpDao$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jettonMaster);
        b_0.storeDict(src.proposals, Dictionary.Keys.Uint(32), dictValueParserProposal());
        b_0.storeUint(src.proposalCount, 32);
        b_0.storeDict(src.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_0.storeUint(src.version, 32);
    };
}

export function loadFpDao$Data(slice: Slice) {
    const sc_0 = slice;
    const _jettonMaster = sc_0.loadAddress();
    const _proposals = Dictionary.load(Dictionary.Keys.Uint(32), dictValueParserProposal(), sc_0);
    const _proposalCount = sc_0.loadUintBig(32);
    const _voted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_0);
    const _version = sc_0.loadUintBig(32);
    return { $$type: 'FpDao$Data' as const, jettonMaster: _jettonMaster, proposals: _proposals, proposalCount: _proposalCount, voted: _voted, version: _version };
}

export function loadTupleFpDao$Data(source: TupleReader) {
    const _jettonMaster = source.readAddress();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.Uint(32), dictValueParserProposal(), source.readCellOpt());
    const _proposalCount = source.readBigNumber();
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _version = source.readBigNumber();
    return { $$type: 'FpDao$Data' as const, jettonMaster: _jettonMaster, proposals: _proposals, proposalCount: _proposalCount, voted: _voted, version: _version };
}

export function loadGetterTupleFpDao$Data(source: TupleReader) {
    const _jettonMaster = source.readAddress();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.Uint(32), dictValueParserProposal(), source.readCellOpt());
    const _proposalCount = source.readBigNumber();
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _version = source.readBigNumber();
    return { $$type: 'FpDao$Data' as const, jettonMaster: _jettonMaster, proposals: _proposals, proposalCount: _proposalCount, voted: _voted, version: _version };
}

export function storeTupleFpDao$Data(source: FpDao$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jettonMaster);
    builder.writeCell(source.proposals.size > 0 ? beginCell().storeDictDirect(source.proposals, Dictionary.Keys.Uint(32), dictValueParserProposal()).endCell() : null);
    builder.writeNumber(source.proposalCount);
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeNumber(source.version);
    return builder.build();
}

export function dictValueParserFpDao$Data(): DictionaryValue<FpDao$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFpDao$Data(src)).endCell());
        },
        parse: (src) => {
            return loadFpDao$Data(src.loadRef().beginParse());
        }
    }
}

 type FpDao_init_args = {
    $$type: 'FpDao_init_args';
    jettonMaster: Address;
    version: bigint;
}

function initFpDao_init_args(src: FpDao_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jettonMaster);
        b_0.storeInt(src.version, 257);
    };
}

async function FpDao_init(jettonMaster: Address, version: bigint) {
    const __code = Cell.fromHex('b5ee9c724102150100048a00022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d90109020271020702037a600305018ca86fed44d0d200019efa40f404d31ff404d31f55406c158e10fa40810101d7005902d101706d026d01e25504db3c6c51206e92306d99206ef2d0806f276f07e2206e92306dde0400588020250259f40f6fa192306ddf206e92306d8e17d0d31fd401d001d31fd31fd31fd200fa4055606c176f07e2015ca8e1ed44d0d200019efa40f404d31ff404d31f55406c158e10fa40810101d7005902d101706d026d01e2db3c6c5106000224015dbe498f6a268690000cf7d207a02698ffa02698faaa0360ac7087d20408080eb802c816880b836813680f16d9e3628c0800022204d201d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019efa40f404d31ff404d31f55406c158e10fa40810101d7005902d101706d026d01e206925f06e07025d74920c21f953105d31f06de21c001e30221c002e30221c003e302218210946a98b6ba0a0c111402c05b04d401d001d31f3081119921c23bf2f4814a388b08523001f90101f901bdf2f422f82358a08020702070f8422606105859c855605067cb1f04c8ce14cd12cb1fcb1fcb1fca00cec91034206e953059f45b30944133f417e201a488103544300b1000280000000050726f706f73616c206372656174656402fe5b04d31fd20030820090af5323b9f2f42380202359f40f6fa192306ddf206e92306d8e17d0d31fd401d001d31fd31fd31fd200fa4055606c176f07e2206ef2d0806f27813f86f82324b9f2f4f8428307db3c2982103b9aca00a80182103b9aca00a908a02d81010122714133f40c6fa19401d70030925b6de28200e7e9216e0d0e0006d7013002ca92317f9801206ef2d080c000e2f2f41d810101017f71216e955b59f45a3098c801cf004133f442e2079203a49402a44013e28020504cc855605067cb1f04c8ce14cd12cb1fcb1fcb1fca00cec910344660206e953059f45b30944133f417e28810354440130f10002000000000566f746520636f756e7465640072f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055405045ce12f400cb1ff400cb1fc9ed5401ee5b04d31f30820090af5312b9f2f42280202259f40f6fa192306ddf206e92306d8e17d0d31fd401d001d31fd31fd31fd200fa4055606c176f07e2206ef2d0806f278200a398f82324bef2f48200cdcb02b312f2f4151443307f80204717c855605067cb1f04c8ce14cd12cb1fcb1fcb1fca00cec910341212019a206e953059f45b30944133f417e2881035444013f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055405045ce12f400cb1ff400cb1fc9ed5413002a0000000050726f706f73616c20657865637574656400f68e505b04d33f30c8018210aff90f5758cb1fcb3fc910354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055405045ce12f400cb1ff400cb1fc9ed54e036c00005c12115b08e184034c87f01ca0055405045ce12f400cb1ff400cb1fc9ed54e05f05f2c082d567f8ee');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initFpDao_init_args({ $$type: 'FpDao_init_args', jettonMaster, version })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const FpDao_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    4505: { message: "Duration must be >= 60 seconds" },
    16262: { message: "Voting period has ended" },
    19000: { message: "Description cannot be empty" },
    37039: { message: "Proposal not found" },
    41880: { message: "Voting still active" },
    52683: { message: "Already executed" },
    59369: { message: "Already voted" },
} as const

export const FpDao_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Duration must be >= 60 seconds": 4505,
    "Voting period has ended": 16262,
    "Description cannot be empty": 19000,
    "Proposal not found": 37039,
    "Voting still active": 41880,
    "Already executed": 52683,
    "Already voted": 59369,
} as const

const FpDao_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CreateProposal","header":1,"fields":[{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"duration","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"Vote","header":2,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ExecuteProposal","header":3,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"Proposal","header":null,"fields":[{"name":"id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"executed","type":{"kind":"simple","type":"bool","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"FpDao$Data","header":null,"fields":[{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"proposals","type":{"kind":"dict","key":"uint","keyFormat":32,"value":"Proposal","valueFormat":"ref"}},{"name":"proposalCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"voted","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"version","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
]

const FpDao_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "CreateProposal": 1,
    "Vote": 2,
    "ExecuteProposal": 3,
}

const FpDao_getters: ABIGetter[] = [
    {"name":"getProposal","methodId":84079,"arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"Proposal","optional":true}},
    {"name":"getProposalCount","methodId":117041,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getJettonMaster","methodId":85217,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const FpDao_getterMapping: { [key: string]: string } = {
    'getProposal': 'getGetProposal',
    'getProposalCount': 'getGetProposalCount',
    'getJettonMaster': 'getGetJettonMaster',
}

const FpDao_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CreateProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Vote"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecuteProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class FpDao implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = FpDao_errors_backward;
    public static readonly opcodes = FpDao_opcodes;
    
    static async init(jettonMaster: Address, version: bigint) {
        return await FpDao_init(jettonMaster, version);
    }
    
    static async fromInit(jettonMaster: Address, version: bigint) {
        const __gen_init = await FpDao_init(jettonMaster, version);
        const address = contractAddress(0, __gen_init);
        return new FpDao(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new FpDao(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  FpDao_types,
        getters: FpDao_getters,
        receivers: FpDao_receivers,
        errors: FpDao_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | CreateProposal | Vote | ExecuteProposal | Deploy) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateProposal') {
            body = beginCell().store(storeCreateProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Vote') {
            body = beginCell().store(storeVote(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecuteProposal') {
            body = beginCell().store(storeExecuteProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetProposal(provider: ContractProvider, id: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(id);
        const source = (await provider.get('getProposal', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleProposal(result_p) : null;
        return result;
    }
    
    async getGetProposalCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getProposalCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetJettonMaster(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getJettonMaster', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}
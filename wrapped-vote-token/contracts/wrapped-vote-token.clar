;; =========================
;; Wrapped Vote Token (clean production lab version)
;; =========================

(define-map balances principal uint)
(define-map processed-events uint bool)

;; =========================
;; ORACLE (SET YOUR ADDRESS HERE)
;; =========================
(define-data-var oracle principal 'ST3YH871R62HT9F88PYAV1NM0BMZT8V712JK03PTZ)

;; =========================
;; READ BALANCE
;; =========================
(define-read-only (balance-of (who principal))
  (default-to u0 (map-get? balances who))
)

;; =========================
;; INTERNAL CHECK ORACLE
;; =========================
(define-private (is-oracle)
  (is-eq tx-sender (var-get oracle))
)

;; =========================
;; MINT (ONLY ORACLE)
;; =========================
(define-public (mint (to principal) (amount uint) (event-id uint))
  (begin
    (asserts! (is-oracle) (err u401))
    (asserts! (is-none (map-get? processed-events event-id)) (err u409))

    (map-set balances to (+ (balance-of to) amount))
    (map-set processed-events event-id true)

    (ok true)
  )
)

;; =========================
;; BURN (USER)
;; =========================
(define-public (burn (amount uint))
  (let ((bal (balance-of tx-sender)))
    (asserts! (>= bal amount) (err u400))

    (map-set balances tx-sender (- bal amount))
    (ok true)
  )
)

;; =========================
;; LOCK (TRIGGERS BRIDGE)
;; =========================
(define-public (lock (amount uint) (ton-recipient (string-ascii 128)) (event-id uint))
  (let ((bal (balance-of tx-sender)))
    (asserts! (> amount u0) (err u400))
    (asserts! (>= bal amount) (err u400))
    (asserts! (is-none (map-get? processed-events event-id)) (err u409))

    (map-set balances tx-sender (- bal amount))
    (map-set processed-events event-id true)

    (ok true)
  )
)

;; =========================
;; VIEW ORACLE
;; =========================
(define-read-only (get-oracle)
  (var-get oracle)
)
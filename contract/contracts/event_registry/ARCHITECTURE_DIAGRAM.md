# Multi-Sig Governance Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Registry Contract                       │
│                     (Multi-Sig Governance)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Event      │    │  Governance  │    │   Storage    │
│  Management  │    │   System     │    │    Layer     │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Governance System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Governance Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Proposal   │      │   Approval   │      │  Execution   │  │
│  │   Creation   │─────▶│   Process    │─────▶│   Engine     │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Validation & Safety Checks                   │  │
│  │  • Admin verification    • Threshold validation           │  │
│  │  • Duplicate prevention  • Expiration checks              │  │
│  │  • Last admin protection • Address validation             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Proposal Lifecycle

```
┌─────────────┐
│   CREATED   │  ← Admin creates proposal (auto-approved by proposer)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  APPROVING  │  ← Other admins add approvals
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  APPROVED   │   │   EXPIRED   │  ← Time limit exceeded
└──────┬──────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│  EXECUTED   │  ← Changes applied to contract state
└─────────────┘
```

## Multi-Sig Workflow

```
                    ┌──────────────────────────────────┐
                    │      Admin 1 (Proposer)          │
                    └────────────┬─────────────────────┘
                                 │
                                 │ 1. Create Proposal
                                 │    (auto-approved)
                                 ▼
                    ┌──────────────────────────────────┐
                    │         Proposal Store           │
                    │   ID: 1, Approvals: [Admin1]     │
                    └────────────┬─────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │     Admin 2      │ │   Admin 3    │ │   Admin N    │
    │  2. Approve      │ │  2. Approve  │ │  2. Approve  │
    └────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
             │                  │                 │
             └──────────────────┼─────────────────┘
                                │
                                ▼
                    ┌──────────────────────────────────┐
                    │      Threshold Check             │
                    │  Approvals >= Threshold?         │
                    └────────────┬─────────────────────┘
                                 │
                                 │ YES
                                 ▼
                    ┌──────────────────────────────────┐
                    │      Any Admin Executes          │
                    │   3. Execute Proposal            │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────────┐
                    │    State Change Applied          │
                    │  • Platform Wallet Updated       │
                    │  • Admin Added/Removed           │
                    │  • Threshold Changed             │
                    └──────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Storage Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  MultiSigConfig  │  │    Proposals     │  │  Event Data  │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ • admins: Vec    │  │ • proposal_id    │  │ • event_id   │  │
│  │ • threshold: u32 │  │ • type           │  │ • organizer  │  │
│  └──────────────────┘  │ • proposer       │  │ • payment    │  │
│                        │ • approvals      │  └──────────────┘  │
│  ┌──────────────────┐  │ • created_at     │                    │
│  │ Platform Config  │  │ • expires_at     │  ┌──────────────┐  │
│  ├──────────────────┤  │ • executed       │  │ Active List  │  │
│  │ • wallet         │  └──────────────────┘  ├──────────────┤  │
│  │ • fee_percent    │                        │ • [id1, id2] │  │
│  └──────────────────┘                        └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Proposal Types & Actions

```
┌─────────────────────────────────────────────────────────────────┐
│                      Proposal Types                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SetPlatformWallet(Address)                                      │
│  ├─ Validates: Address is valid                                  │
│  └─ Action: Updates platform_wallet in storage                   │
│                                                                   │
│  AddAdmin(Address)                                               │
│  ├─ Validates: Address is valid, not duplicate                   │
│  └─ Action: Adds to admins vector in MultiSigConfig              │
│                                                                   │
│  RemoveAdmin(Address)                                            │
│  ├─ Validates: Admin exists, not last admin                      │
│  └─ Action: Removes from admins, adjusts threshold if needed     │
│                                                                   │
│  SetThreshold(u32)                                               │
│  ├─ Validates: 0 < threshold <= admin_count                      │
│  └─ Action: Updates threshold in MultiSigConfig                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Authentication                                         │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • require_auth() on all governance functions           │     │
│  │ • is_admin() check before operations                   │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  Layer 2: Validation                                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Address validation (not contract address)            │     │
│  │ • Proposal type validation                             │     │
│  │ • Threshold bounds checking                            │     │
│  │ • Duplicate prevention                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  Layer 3: Authorization                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Threshold enforcement                                │     │
│  │ • Approval count verification                          │     │
│  │ • Expiration checking                                  │     │
│  │ • Execution state verification                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│  Layer 4: Safety Mechanisms                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Cannot remove last admin                             │     │
│  │ • Auto-adjust threshold on admin removal               │     │
│  │ • Prevent double approval/execution                    │     │
│  │ • Proposal expiration enforcement                      │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Event Emission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Event System                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Governance Action          Event Emitted                        │
│  ─────────────────          ─────────────                        │
│                                                                   │
│  create_proposal()    ──▶   ProposalCreated                      │
│                             • proposal_id                        │
│                             • proposer                           │
│                             • timestamp                          │
│                                                                   │
│  approve_proposal()   ──▶   ProposalApproved                     │
│                             • proposal_id                        │
│                             • approver                           │
│                             • timestamp                          │
│                                                                   │
│  execute_proposal()   ──▶   ProposalExecuted                     │
│                             • proposal_id                        │
│                             • executor                           │
│                             • timestamp                          │
│                                                                   │
│  (add admin)          ──▶   AdminAdded                           │
│                             • admin                              │
│                             • added_by                           │
│                             • timestamp                          │
│                                                                   │
│  (remove admin)       ──▶   AdminRemoved                         │
│                             • admin                              │
│                             • removed_by                         │
│                             • timestamp                          │
│                                                                   │
│  (set threshold)      ──▶   ThresholdUpdated                     │
│                             • old_threshold                      │
│                             • new_threshold                      │
│                             • timestamp                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## State Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                   Contract State Evolution                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Initial State                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Admins: [Admin1]                                       │     │
│  │ Threshold: 1                                           │     │
│  │ Platform Wallet: Wallet1                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          │ propose_add_admin(Admin2)             │
│                          │ execute_proposal()                    │
│                          ▼                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Admins: [Admin1, Admin2]                               │     │
│  │ Threshold: 1                                           │     │
│  │ Platform Wallet: Wallet1                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          │ propose_set_threshold(2)              │
│                          │ execute_proposal()                    │
│                          ▼                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Admins: [Admin1, Admin2]                               │     │
│  │ Threshold: 2  ← Multi-sig active                       │     │
│  │ Platform Wallet: Wallet1                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          │ propose_set_platform_wallet(Wallet2)  │
│                          │ approve_proposal(Admin2)              │
│                          │ execute_proposal()                    │
│                          ▼                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Admins: [Admin1, Admin2]                               │     │
│  │ Threshold: 2                                           │     │
│  │ Platform Wallet: Wallet2  ← Changed via multi-sig      │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Interfaces                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend/Client                                                 │
│  ├─ Query Functions                                              │
│  │  ├─ get_multisig_config()                                     │
│  │  ├─ get_proposal(id)                                          │
│  │  ├─ get_active_proposals()                                    │
│  │  └─ is_admin(address)                                         │
│  │                                                                │
│  └─ Action Functions                                             │
│     ├─ propose_*()                                               │
│     ├─ approve_proposal()                                        │
│     └─ execute_proposal()                                        │
│                                                                   │
│  Event Listeners                                                 │
│  ├─ ProposalCreated → Notify admins                              │
│  ├─ ProposalApproved → Update UI                                 │
│  ├─ ProposalExecuted → Refresh state                             │
│  └─ Admin* / Threshold* → Update config display                  │
│                                                                   │
│  Monitoring/Analytics                                            │
│  ├─ Track proposal creation rate                                 │
│  ├─ Monitor approval times                                       │
│  ├─ Alert on expired proposals                                   │
│  └─ Audit governance actions                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Handling                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Operation Attempt                                               │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────┐                                                │
│  │ Validation   │                                                │
│  └──────┬───────┘                                                │
│         │                                                         │
│    ┌────┴────┐                                                   │
│    │  Valid? │                                                   │
│    └────┬────┘                                                   │
│         │                                                         │
│    ┌────┴────────────────────┐                                   │
│    │                         │                                   │
│   YES                       NO                                   │
│    │                         │                                   │
│    ▼                         ▼                                   │
│  ┌──────────────┐    ┌──────────────────┐                       │
│  │  Continue    │    │  Return Error    │                       │
│  │  Operation   │    │  • Unauthorized  │                       │
│  └──────┬───────┘    │  • InvalidAddr   │                       │
│         │            │  • NotFound      │                       │
│         ▼            │  • Expired       │                       │
│  ┌──────────────┐    │  • etc.          │                       │
│  │  Execute     │    └──────────────────┘                       │
│  └──────┬───────┘                                                │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────┐                                                │
│  │  Success     │                                                │
│  │  Emit Event  │                                                │
│  └──────────────┘                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Profile                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Operation              Complexity    Storage Impact             │
│  ─────────              ──────────    ───────────────            │
│                                                                   │
│  create_proposal()      O(1)          +1 proposal                │
│  approve_proposal()     O(n)          +1 approval                │
│  execute_proposal()     O(n)          state change               │
│  get_proposal()         O(1)          read-only                  │
│  get_active_proposals() O(1)          read-only                  │
│  is_admin()             O(n)          read-only                  │
│                                                                   │
│  where n = number of admins (typically small, < 10)              │
│                                                                   │
│  Optimization Strategies:                                        │
│  • Keep admin count reasonable (< 10 recommended)                │
│  • Clean up executed proposals periodically                      │
│  • Use expiration to prevent proposal accumulation               │
│  • Efficient vector operations for admin checks                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides a robust, secure, and scalable multi-signature governance system for the Event Registry smart contract.

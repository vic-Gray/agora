# Multi-Signature Governance Implementation

## Overview

This implementation introduces a robust multi-signature authorization pattern for managing sensitive platform parameters in the Event Registry smart contract. This eliminates the single point of failure associated with centralized control and provides a foundation for decentralized governance.

## Key Features

### 1. Multi-Admin Support
- Support for multiple administrator addresses
- Configurable signature threshold (N-of-M signatures required)
- Prevents contract lockout by enforcing at least one admin at all times

### 2. Proposal-Based Governance
- All sensitive operations require creating a proposal
- Proposals track approvals from multiple admins
- Proposals can have expiration times for time-sensitive decisions
- Automatic cleanup of executed proposals from active list

### 3. Supported Operations
The following operations now require multi-sig approval:

- **Set Platform Wallet**: Change the address receiving platform fees
- **Add Admin**: Add a new administrator to the multi-sig group
- **Remove Admin**: Remove an existing administrator (with safety checks)
- **Set Threshold**: Adjust the number of required signatures

### 4. Safety Mechanisms
- Cannot remove the last admin (prevents contract lockout)
- Cannot add duplicate admins
- Threshold must be > 0 and ≤ admin count
- Threshold auto-adjusts when admins are removed
- Proposals cannot be executed twice
- Admins cannot approve the same proposal twice
- Expired proposals cannot be approved or executed

## Architecture

### New Types

#### `MultiSigConfig`
```rust
pub struct MultiSigConfig {
    pub admins: Vec<Address>,      // List of admin addresses
    pub threshold: u32,             // Required signatures
}
```

#### `ProposalType`
```rust
pub enum ProposalType {
    SetPlatformWallet(Address),
    AddAdmin(Address),
    RemoveAdmin(Address),
    SetThreshold(u32),
}
```

#### `Proposal`
```rust
pub struct Proposal {
    pub proposal_id: u64,
    pub proposal_type: ProposalType,
    pub proposer: Address,
    pub approvals: Vec<Address>,
    pub created_at: u64,
    pub expires_at: u64,
    pub executed: bool,
}
```

### Storage Keys
Extended `DataKey` enum with:
- `MultiSigConfig`: Stores the multi-sig configuration
- `ProposalCounter`: Auto-incrementing proposal ID counter
- `Proposal(u64)`: Maps proposal ID to proposal data
- `ActiveProposals`: List of non-executed proposal IDs

## Usage Workflow

### Initial Setup
```rust
// Initialize contract with single admin (threshold = 1)
initialize(admin, platform_wallet, platform_fee_percent);
```

### Adding Additional Admins
```rust
// 1. Create proposal to add new admin
let proposal_id = propose_add_admin(proposer, new_admin, expiration_ledgers);

// 2. If threshold > 1, other admins approve
approve_proposal(approver, proposal_id);

// 3. Execute when threshold is met
execute_proposal(executor, proposal_id);
```

### Changing Platform Wallet (Multi-Sig)
```rust
// 1. Create proposal
let proposal_id = propose_set_platform_wallet(proposer, new_wallet, expiration_ledgers);

// 2. Collect required approvals
approve_proposal(admin2, proposal_id);
approve_proposal(admin3, proposal_id);

// 3. Execute
execute_proposal(executor, proposal_id);
```

### Adjusting Threshold
```rust
// 1. Propose new threshold
let proposal_id = propose_set_threshold(proposer, new_threshold, expiration_ledgers);

// 2. Get approvals (using OLD threshold)
approve_proposal(admin2, proposal_id);

// 3. Execute
execute_proposal(executor, proposal_id);
```

### Removing an Admin
```rust
// 1. Propose removal
let proposal_id = propose_remove_admin(proposer, admin_to_remove, expiration_ledgers);

// 2. Collect approvals (including from the admin being removed if needed)
approve_proposal(admin2, proposal_id);

// 3. Execute
execute_proposal(executor, proposal_id);
// Note: Threshold auto-adjusts if it exceeds remaining admin count
```

## API Reference

### Governance Functions

#### `create_proposal`
```rust
pub fn create_proposal(
    env: Env,
    proposer: Address,
    proposal_type: ProposalType,
    expiration_ledgers: u32,
) -> Result<u64, EventRegistryError>
```
Creates a new proposal. Proposer automatically approves. Returns proposal ID.

#### `approve_proposal`
```rust
pub fn approve_proposal(
    env: Env,
    approver: Address,
    proposal_id: u64,
) -> Result<(), EventRegistryError>
```
Adds an admin's approval to a proposal.

#### `execute_proposal`
```rust
pub fn execute_proposal(
    env: Env,
    executor: Address,
    proposal_id: u64,
) -> Result<(), EventRegistryError>
```
Executes a proposal if it has sufficient approvals.

### Convenience Functions

#### `propose_set_platform_wallet`
```rust
pub fn propose_set_platform_wallet(
    env: Env,
    proposer: Address,
    new_wallet: Address,
    expiration_ledgers: u32,
) -> Result<u64, EventRegistryError>
```

#### `propose_add_admin`
```rust
pub fn propose_add_admin(
    env: Env,
    proposer: Address,
    new_admin: Address,
    expiration_ledgers: u32,
) -> Result<u64, EventRegistryError>
```

#### `propose_remove_admin`
```rust
pub fn propose_remove_admin(
    env: Env,
    proposer: Address,
    admin_to_remove: Address,
    expiration_ledgers: u32,
) -> Result<u64, EventRegistryError>
```

#### `propose_set_threshold`
```rust
pub fn propose_set_threshold(
    env: Env,
    proposer: Address,
    new_threshold: u32,
    expiration_ledgers: u32,
) -> Result<u64, EventRegistryError>
```

### Query Functions

#### `get_proposal`
```rust
pub fn get_proposal(
    env: Env,
    proposal_id: u64,
) -> Result<Proposal, EventRegistryError>
```

#### `get_active_proposals`
```rust
pub fn get_active_proposals(env: Env) -> Vec<u64>
```

#### `get_multisig_config`
```rust
pub fn get_multisig_config(env: Env) -> Result<MultiSigConfig, EventRegistryError>
```

#### `is_admin`
```rust
pub fn is_admin(env: Env, address: Address) -> bool
```

## Events

New events emitted for governance actions:

- `ProposalCreated`: When a new proposal is created
- `ProposalApproved`: When an admin approves a proposal
- `ProposalExecuted`: When a proposal is executed
- `AdminAdded`: When a new admin is added
- `AdminRemoved`: When an admin is removed
- `ThresholdUpdated`: When the signature threshold changes

## Error Codes

New error codes:
- `ProposalNotFound` (10): Proposal ID doesn't exist
- `ProposalAlreadyExecuted` (11): Attempting to execute/approve executed proposal
- `ProposalExpired` (12): Proposal has passed its expiration time
- `AlreadyApproved` (13): Admin already approved this proposal
- `InsufficientApprovals` (14): Not enough approvals to execute
- `InvalidThreshold` (15): Threshold is 0 or exceeds admin count
- `AdminAlreadyExists` (16): Attempting to add existing admin
- `AdminNotFound` (17): Admin address not in multi-sig config
- `CannotRemoveLastAdmin` (18): Attempting to remove the only admin
- `InvalidProposalType` (19): Proposal validation failed

## Security Considerations

### 1. Initialization
- Contract initializes with single admin and threshold of 1
- Backward compatible with existing single-admin pattern
- Gradual migration path to multi-sig

### 2. Admin Management
- Minimum one admin enforced at all times
- Duplicate admin prevention
- Threshold auto-adjustment on admin removal

### 3. Proposal Lifecycle
- Proposer auto-approves (counts toward threshold)
- Proposals can expire to prevent stale governance
- Executed proposals cannot be re-executed
- Active proposal tracking for transparency

### 4. Authorization
- All governance functions require admin authentication
- Proposal execution validates threshold before applying changes
- Address validation prevents invalid addresses

## Migration Path

### From Single Admin to Multi-Sig

1. **Initial State**: Contract has single admin (threshold = 1)
2. **Add Second Admin**: Create and execute proposal to add admin
3. **Increase Threshold**: Create and execute proposal to set threshold = 2
4. **Add More Admins**: Repeat as needed (now requires 2 approvals)
5. **Adjust Threshold**: Set to desired N-of-M configuration

### Example Migration
```rust
// Step 1: Contract initialized with admin1
initialize(admin1, platform_wallet, 500);

// Step 2: Admin1 adds admin2 (threshold still 1)
let proposal_id = propose_add_admin(admin1, admin2, 0);
execute_proposal(admin1, proposal_id);

// Step 3: Set threshold to 2 (requires both admins going forward)
let proposal_id = propose_set_threshold(admin1, 2, 0);
execute_proposal(admin1, proposal_id);

// Step 4: Add admin3 (now requires 2 approvals)
let proposal_id = propose_add_admin(admin1, admin3, 0);
approve_proposal(admin2, proposal_id);
execute_proposal(admin1, proposal_id);

// Step 5: Set threshold to 2-of-3
let proposal_id = propose_set_threshold(admin1, 2, 0);
approve_proposal(admin2, proposal_id);
execute_proposal(admin1, proposal_id);
```

## Testing

Comprehensive test suite in `test_multisig.rs` covers:

- ✅ Initialization with multi-sig config
- ✅ Proposal creation and execution
- ✅ Multi-admin approval workflow
- ✅ Platform wallet changes via proposal
- ✅ Admin addition and removal
- ✅ Threshold adjustment
- ✅ Duplicate admin prevention
- ✅ Last admin protection
- ✅ Double approval prevention
- ✅ Double execution prevention
- ✅ Invalid threshold handling
- ✅ Active proposal tracking
- ✅ Proposal expiration
- ✅ Automatic threshold adjustment on admin removal

Run tests with:
```bash
cargo test --package event-registry
```

## Future Enhancements

Potential improvements for future iterations:

1. **Time-Lock Mechanism**: Add mandatory delay between approval and execution
2. **Proposal Cancellation**: Allow proposer to cancel unexecuted proposals
3. **Veto Power**: Implement veto mechanism for critical changes
4. **Weighted Voting**: Different admins have different voting weights
5. **Proposal Comments**: Add metadata/reasoning to proposals
6. **Batch Proposals**: Execute multiple changes atomically
7. **Emergency Pause**: Multi-sig controlled circuit breaker
8. **Governance Token Integration**: Transition to token-based governance

## Conclusion

This implementation provides a production-ready multi-signature governance system that:
- Eliminates single points of failure
- Provides flexible N-of-M authorization
- Maintains backward compatibility
- Includes comprehensive safety checks
- Offers clear migration path from single admin
- Lays foundation for decentralized governance

The proposal-based workflow ensures transparency and auditability of all governance actions while maintaining security through threshold-based authorization.

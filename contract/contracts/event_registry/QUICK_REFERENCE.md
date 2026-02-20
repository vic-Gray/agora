# Multi-Sig Governance Quick Reference

## Core Workflow

```
CREATE → APPROVE → APPROVE → ... → EXECUTE
   ↓         ↓         ↓              ↓
Admin1    Admin2    Admin3      Any Admin
(auto)                         (when threshold met)
```

## Common Commands

### Check Multi-Sig Status
```rust
// Get configuration
let config = get_multisig_config();
// config.admins: Vec<Address>
// config.threshold: u32

// Check if address is admin
let is_admin = is_admin(address);

// Get active proposals
let proposals = get_active_proposals();
```

### Change Platform Wallet
```rust
// Step 1: Create proposal
let id = propose_set_platform_wallet(admin, new_wallet, 1000);

// Step 2: Approve (if threshold > 1)
approve_proposal(admin2, id);

// Step 3: Execute
execute_proposal(admin, id);
```

### Add Admin
```rust
// Step 1: Propose
let id = propose_add_admin(admin, new_admin, 0);

// Step 2: Approve
approve_proposal(admin2, id);

// Step 3: Execute
execute_proposal(admin, id);
```

### Remove Admin
```rust
// Step 1: Propose
let id = propose_remove_admin(admin, old_admin, 0);

// Step 2: Approve
approve_proposal(admin2, id);

// Step 3: Execute
execute_proposal(admin, id);
```

### Change Threshold
```rust
// Step 1: Propose
let id = propose_set_threshold(admin, new_threshold, 0);

// Step 2: Approve (using OLD threshold)
approve_proposal(admin2, id);

// Step 3: Execute (NEW threshold takes effect)
execute_proposal(admin, id);
```

## Error Quick Fix

| Error | Cause | Solution |
|-------|-------|----------|
| `InsufficientApprovals` | Not enough approvals | Get more admins to approve |
| `ProposalExpired` | Proposal timed out | Create new proposal |
| `AlreadyApproved` | Admin approved twice | Different admin should approve |
| `ProposalAlreadyExecuted` | Trying to execute again | Proposal is done |
| `Unauthorized` | Not an admin | Use admin address |
| `InvalidThreshold` | Threshold > admin count or = 0 | Adjust threshold value |
| `CannotRemoveLastAdmin` | Removing only admin | Add another admin first |
| `AdminAlreadyExists` | Adding duplicate admin | Check admin list |

## Expiration Times

```rust
// No expiration
expiration_ledgers: 0

// ~8 minutes
expiration_ledgers: 100

// ~1 hour
expiration_ledgers: 720

// ~1 day
expiration_ledgers: 17280
```

## Threshold Recommendations

| Admins | Conservative | Balanced | Flexible |
|--------|-------------|----------|----------|
| 1 | 1 | 1 | 1 |
| 2 | 2 | 2 | 1 |
| 3 | 3 | 2 | 2 |
| 4 | 4 | 3 | 2 |
| 5 | 5 | 3 | 3 |
| 7 | 7 | 4 | 3 |

## Events Emitted

```rust
ProposalCreated      // New proposal
ProposalApproved     // Admin approved
ProposalExecuted     // Proposal executed
AdminAdded           // New admin added
AdminRemoved         // Admin removed
ThresholdUpdated     // Threshold changed
```

## Safety Rules

✅ **Always Allowed**
- Any admin can create proposals
- Any admin can approve proposals
- Any admin can execute proposals (if threshold met)
- Proposer auto-approves their proposal

❌ **Never Allowed**
- Remove last admin
- Add duplicate admin
- Set threshold to 0
- Set threshold > admin count
- Approve same proposal twice
- Execute without sufficient approvals
- Execute expired proposal
- Execute already-executed proposal

## Migration Path

```
Single Admin (threshold=1)
    ↓ propose_add_admin
Two Admins (threshold=1)
    ↓ propose_set_threshold(2)
Two Admins (threshold=2) ← Multi-sig active
    ↓ propose_add_admin (needs 2 approvals)
Three Admins (threshold=2)
    ↓ propose_set_threshold(3)
Three Admins (threshold=3) ← Full consensus
```

## Code Snippets

### Initialize New Contract
```rust
initialize(admin, platform_wallet, 500);
```

### Setup 2-of-3 Multi-Sig
```rust
// Add admin2
let id = propose_add_admin(admin1, admin2, 0);
execute_proposal(admin1, id);

// Add admin3
let id = propose_add_admin(admin1, admin3, 0);
execute_proposal(admin1, id);

// Set threshold
let id = propose_set_threshold(admin1, 2, 0);
execute_proposal(admin1, id);
```

### Check Proposal Status
```rust
let proposal = get_proposal(proposal_id);
let config = get_multisig_config();

let approvals_needed = config.threshold;
let approvals_current = proposal.approvals.len();
let can_execute = approvals_current >= approvals_needed;
```

### List All Admins
```rust
let config = get_multisig_config();
for admin in config.admins.iter() {
    // Process each admin
}
```

## Testing Checklist

```
□ Create proposal
□ Approve with multiple admins
□ Execute with sufficient approvals
□ Try execute with insufficient approvals (should fail)
□ Try approve twice (should fail)
□ Try execute twice (should fail)
□ Test expiration
□ Add admin
□ Remove admin
□ Change threshold
□ Change platform wallet
```

## Emergency Procedures

### Reduce to Single Admin
```rust
// 1. Lower threshold
let id = propose_set_threshold(admin, 1, 0);
// ... get approvals with OLD threshold
execute_proposal(admin, id);

// 2. Remove other admins
let id = propose_remove_admin(admin, other_admin, 0);
execute_proposal(admin, id);
```

### Add Emergency Admin
```rust
// If threshold allows, any admin can add emergency admin
let id = propose_add_admin(current_admin, emergency_admin, 0);
// ... get approvals
execute_proposal(current_admin, id);
```

## Best Practices

1. **Always test on testnet first**
2. **Document all admin addresses**
3. **Set reasonable expiration times**
4. **Monitor active proposals regularly**
5. **Keep threshold < total admins** (for key loss tolerance)
6. **Use hardware wallets for admin keys**
7. **Coordinate with team before executing**
8. **Verify proposal details before approving**

## Support

- Full docs: `MULTISIG_GOVERNANCE.md`
- Migration guide: `MIGRATION_GUIDE.md`
- Tests: `test_multisig.rs`

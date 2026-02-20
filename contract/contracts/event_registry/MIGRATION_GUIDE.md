# Migration Guide: Single Admin to Multi-Sig Governance

## Overview

This guide provides step-by-step instructions for migrating from the legacy single-admin pattern to the new multi-signature governance system.

## Backward Compatibility

The implementation maintains full backward compatibility:
- Existing contracts continue to work with single admin
- Legacy `get_admin()` function still available
- Initialization creates multi-sig config with threshold = 1
- No breaking changes to existing event management functions

## Migration Scenarios

### Scenario 1: New Deployment (Recommended)

For new contract deployments, you can start with multi-sig from day one:

```rust
// 1. Initialize with first admin
initialize(admin1, platform_wallet, 500);

// 2. Add additional admins
let proposal_id = propose_add_admin(admin1, admin2, 0);
execute_proposal(admin1, proposal_id);

let proposal_id = propose_add_admin(admin1, admin3, 0);
execute_proposal(admin1, proposal_id);

// 3. Set desired threshold (e.g., 2-of-3)
let proposal_id = propose_set_threshold(admin1, 2, 0);
execute_proposal(admin1, proposal_id);
```

### Scenario 2: Existing Single-Admin Contract

For contracts already deployed with single admin:

#### Step 1: Verify Current State
```rust
// Check current admin
let current_admin = get_admin();

// Check if multi-sig is initialized
let config = get_multisig_config();
// If this returns an error, contract needs migration
```

#### Step 2: Add Second Admin
```rust
// Current admin proposes to add second admin
let proposal_id = propose_add_admin(current_admin, new_admin, 0);

// Execute immediately (threshold = 1)
execute_proposal(current_admin, proposal_id);

// Verify
assert!(is_admin(new_admin));
```

#### Step 3: Increase Threshold
```rust
// Propose threshold increase
let proposal_id = propose_set_threshold(current_admin, 2, 0);

// Execute (still only needs 1 approval)
execute_proposal(current_admin, proposal_id);

// From now on, all proposals need 2 approvals
```

#### Step 4: Add More Admins (Optional)
```rust
// Now requires 2 approvals
let proposal_id = propose_add_admin(admin1, admin3, 0);
approve_proposal(admin2, proposal_id);
execute_proposal(admin1, proposal_id);
```

### Scenario 3: Gradual Multi-Sig Adoption

For organizations wanting to test multi-sig gradually:

#### Phase 1: Add Backup Admin (Threshold = 1)
```rust
// Add backup admin but keep threshold at 1
let proposal_id = propose_add_admin(primary_admin, backup_admin, 0);
execute_proposal(primary_admin, proposal_id);

// Either admin can now execute proposals independently
```

#### Phase 2: Require Dual Approval for Critical Operations
```rust
// Increase threshold to 2
let proposal_id = propose_set_threshold(primary_admin, 2, 0);
execute_proposal(primary_admin, proposal_id);

// Test with a non-critical change
let proposal_id = propose_set_platform_wallet(primary_admin, test_wallet, 0);
approve_proposal(backup_admin, proposal_id);
execute_proposal(primary_admin, proposal_id);
```

#### Phase 3: Add Full Multi-Sig Team
```rust
// Add remaining team members
for new_admin in team_admins {
    let proposal_id = propose_add_admin(primary_admin, new_admin, 0);
    approve_proposal(backup_admin, proposal_id);
    execute_proposal(primary_admin, proposal_id);
}

// Adjust threshold as needed (e.g., 3-of-5)
let proposal_id = propose_set_threshold(primary_admin, 3, 0);
// Collect 2 approvals
approve_proposal(backup_admin, proposal_id);
execute_proposal(primary_admin, proposal_id);
```

## Common Operations After Migration

### Changing Platform Wallet

```rust
// 1. Any admin creates proposal
let proposal_id = propose_set_platform_wallet(
    admin1,
    new_wallet_address,
    1000  // Expires in ~1000 ledgers (~83 minutes)
);

// 2. Other admins approve
approve_proposal(admin2, proposal_id);
approve_proposal(admin3, proposal_id);  // If threshold requires it

// 3. Any admin executes once threshold is met
execute_proposal(admin1, proposal_id);
```

### Adding New Admin

```rust
// 1. Propose new admin
let proposal_id = propose_add_admin(
    proposer,
    new_admin_address,
    2000  // 2000 ledgers expiration
);

// 2. Collect approvals
approve_proposal(admin2, proposal_id);
// ... more approvals as needed

// 3. Execute
execute_proposal(executor, proposal_id);
```

### Removing Admin

```rust
// 1. Propose removal
let proposal_id = propose_remove_admin(
    proposer,
    admin_to_remove,
    0  // No expiration
);

// 2. Collect approvals (may include the admin being removed)
approve_proposal(admin2, proposal_id);
approve_proposal(admin3, proposal_id);

// 3. Execute
execute_proposal(executor, proposal_id);

// Note: Threshold auto-adjusts if needed
```

### Adjusting Threshold

```rust
// 1. Propose new threshold
let proposal_id = propose_set_threshold(
    proposer,
    new_threshold,
    500
);

// 2. Get approvals using CURRENT threshold
approve_proposal(admin2, proposal_id);
// ... collect current threshold number of approvals

// 3. Execute (new threshold takes effect immediately)
execute_proposal(executor, proposal_id);
```

## Best Practices

### 1. Threshold Selection

**Conservative Approach (High Security)**
- 3-of-3 for 3 admins
- 4-of-5 for 5 admins
- Pros: Maximum security
- Cons: Single admin unavailability blocks operations

**Balanced Approach (Recommended)**
- 2-of-3 for 3 admins
- 3-of-5 for 5 admins
- Pros: Security + availability
- Cons: Requires coordination

**Flexible Approach**
- 2-of-4 for 4 admins
- 3-of-7 for 7 admins
- Pros: High availability
- Cons: Lower security threshold

### 2. Proposal Expiration

**Time-Sensitive Changes**
```rust
// Short expiration for urgent changes
let proposal_id = propose_set_platform_wallet(
    admin,
    new_wallet,
    100  // ~8 minutes
);
```

**Routine Changes**
```rust
// Moderate expiration for normal operations
let proposal_id = propose_add_admin(
    admin,
    new_admin,
    2000  // ~2.7 hours
);
```

**Strategic Changes**
```rust
// Long expiration or no expiration for strategic decisions
let proposal_id = propose_set_threshold(
    admin,
    new_threshold,
    0  // No expiration
);
```

### 3. Admin Key Management

- **Distribute Keys**: Ensure admin keys are held by different individuals/systems
- **Secure Storage**: Use hardware wallets or secure key management systems
- **Backup Procedures**: Document recovery procedures if admin keys are lost
- **Regular Rotation**: Consider periodic admin rotation for security

### 4. Monitoring and Transparency

```rust
// Regularly check active proposals
let active = get_active_proposals();
for proposal_id in active {
    let proposal = get_proposal(proposal_id);
    // Log or display proposal details
}

// Monitor multi-sig configuration
let config = get_multisig_config();
// Verify expected admins and threshold
```

## Rollback Procedures

### Emergency: Reduce to Single Admin

If multi-sig becomes problematic, you can reduce back to single admin:

```rust
// 1. Reduce threshold to 1 (requires current threshold approvals)
let proposal_id = propose_set_threshold(primary_admin, 1, 0);
// ... collect approvals
execute_proposal(primary_admin, proposal_id);

// 2. Remove extra admins (now only needs 1 approval)
for admin in admins_to_remove {
    let proposal_id = propose_remove_admin(primary_admin, admin, 0);
    execute_proposal(primary_admin, proposal_id);
}
```

## Testing Checklist

Before deploying multi-sig to production:

- [ ] Test proposal creation with each admin
- [ ] Test approval workflow with minimum threshold
- [ ] Test approval workflow with threshold + 1 approvals
- [ ] Test execution with insufficient approvals (should fail)
- [ ] Test execution with sufficient approvals (should succeed)
- [ ] Test proposal expiration
- [ ] Test adding admin
- [ ] Test removing admin
- [ ] Test threshold adjustment
- [ ] Test platform wallet change
- [ ] Verify events are emitted correctly
- [ ] Test with expired proposals (should fail)
- [ ] Test double approval (should fail)
- [ ] Test double execution (should fail)
- [ ] Test removing last admin (should fail)

## Troubleshooting

### Issue: Proposal Execution Fails with "InsufficientApprovals"

**Solution**: Check current threshold and approval count
```rust
let config = get_multisig_config();
let proposal = get_proposal(proposal_id);

// Ensure: proposal.approvals.len() >= config.threshold
```

### Issue: Cannot Approve Proposal

**Possible Causes**:
1. Not an admin: Verify with `is_admin(address)`
2. Already approved: Check `proposal.approvals`
3. Proposal expired: Check `proposal.expires_at`
4. Proposal executed: Check `proposal.executed`

### Issue: Threshold Too High After Admin Removal

**Solution**: The contract auto-adjusts threshold when admins are removed. If threshold is still too high, create a proposal to reduce it:
```rust
let proposal_id = propose_set_threshold(admin, lower_threshold, 0);
```

### Issue: Lost Admin Key

**Prevention**: Always maintain threshold < total admins
- With 3 admins and threshold 2, you can lose 1 key
- With 5 admins and threshold 3, you can lose 2 keys

**Recovery**: If you lose too many keys and cannot meet threshold, contract governance is locked. This is by design for security. Prevention is critical.

## Support and Resources

- **Documentation**: See `MULTISIG_GOVERNANCE.md` for detailed API reference
- **Tests**: Review `test_multisig.rs` for usage examples
- **Events**: Monitor blockchain events for governance actions

## Conclusion

The multi-sig governance system provides enterprise-grade security for platform management while maintaining flexibility and backward compatibility. Follow this guide carefully to ensure a smooth migration and secure operations.

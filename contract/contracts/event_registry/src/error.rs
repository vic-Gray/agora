use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EventRegistryError {
    EventAlreadyExists = 1,
    EventNotFound = 2,
    Unauthorized = 3,
    InvalidAddress = 4,
    InvalidFeePercent = 5,
    EventInactive = 6,
    NotInitialized = 7,
    AlreadyInitialized = 8,
    InvalidMetadataCid = 9,
    ProposalNotFound = 10,
    ProposalAlreadyExecuted = 11,
    ProposalExpired = 12,
    AlreadyApproved = 13,
    InsufficientApprovals = 14,
    InvalidThreshold = 15,
    AdminAlreadyExists = 16,
    AdminNotFound = 17,
    CannotRemoveLastAdmin = 18,
    InvalidProposalType = 19,
}

impl core::fmt::Display for EventRegistryError {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            EventRegistryError::EventAlreadyExists => write!(f, "Event already exists"),
            EventRegistryError::EventNotFound => write!(f, "Event not found"),
            EventRegistryError::Unauthorized => write!(f, "Caller not authorized for action"),
            EventRegistryError::InvalidAddress => write!(f, "Invalid Stellar address"),
            EventRegistryError::InvalidFeePercent => {
                write!(f, "Fee percent must be between 0 and 10000")
            }
            EventRegistryError::EventInactive => {
                write!(f, "Trying to interact with inactive event")
            }
            EventRegistryError::NotInitialized => write!(f, "Contract not initialized"),
            EventRegistryError::AlreadyInitialized => write!(f, "Contract already initialized"),
            EventRegistryError::InvalidMetadataCid => write!(f, "Invalid IPFS Metadata CID format"),
            EventRegistryError::ProposalNotFound => write!(f, "Proposal not found"),
            EventRegistryError::ProposalAlreadyExecuted => write!(f, "Proposal already executed"),
            EventRegistryError::ProposalExpired => write!(f, "Proposal has expired"),
            EventRegistryError::AlreadyApproved => write!(f, "Already approved by this admin"),
            EventRegistryError::InsufficientApprovals => {
                write!(f, "Insufficient approvals to execute proposal")
            }
            EventRegistryError::InvalidThreshold => {
                write!(f, "Threshold must be greater than 0 and not exceed admin count")
            }
            EventRegistryError::AdminAlreadyExists => write!(f, "Admin already exists"),
            EventRegistryError::AdminNotFound => write!(f, "Admin not found"),
            EventRegistryError::CannotRemoveLastAdmin => {
                write!(f, "Cannot remove the last admin")
            }
            EventRegistryError::InvalidProposalType => write!(f, "Invalid proposal type"),
        }
    }
}

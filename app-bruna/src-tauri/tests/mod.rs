mod integration_tests;
mod test_config;

pub use test_config::{TestConfig, TestUtils};
pub use integration_tests::*;

// Re-export para facilitar uso nos testes
pub use anyhow::Result;

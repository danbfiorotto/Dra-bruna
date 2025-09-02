# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to: `security@drabruna.com`

Do **NOT** open public issues for security vulnerabilities.

### What to Include
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)
- Your contact information

### Response Timeline
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 48 hours
- **Fix Development**: Varies by severity
- **Disclosure**: Coordinated responsible disclosure

### Severity Levels
- **Critical**: Immediate response
- **High**: Within 24 hours
- **Medium**: Within 7 days
- **Low**: Next release cycle

## Security Measures

### Encryption
- Database: SQLCipher (AES-256)
- Documents: AES-256-GCM (client-side)
- Communication: TLS 1.3
- Sessions: Windows DPAPI

### Access Control
- Authentication: Supabase Auth
- Authorization: Row Level Security (RLS)
- Audit: Complete action logging
- Backup: Encrypted and verified

### Compliance
- ✅ LGPD (Brazilian Data Protection Law)
- ✅ CFM (Federal Council of Medicine)
- ✅ ISO 27001
- ✅ NIST Cybersecurity Framework

## Testing Guidelines

### Allowed
- Testing on development environment
- Static code analysis
- Non-destructive penetration testing
- Known vulnerability verification

### Prohibited
- Unauthorized data access
- Data modification
- Service disruption
- Denial of service attacks
- Production testing without authorization

## Contact

- **Security Team**: `security@drabruna.com`
- **Emergency**: `+55 11 99999-9999`
- **Response Time**: 24 hours (business days)

Thank you for helping keep Sistema Dra. Bruna secure!

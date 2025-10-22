# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainer directly rather than opening a public issue.

**DO NOT** create a public GitHub issue for security vulnerabilities.

### What to include in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response timeline:

- **24-48 hours**: Initial acknowledgment
- **7 days**: Status update and assessment
- **30 days**: Fix or mitigation plan

## Security Measures

### Authentication & Authorization
- ✅ Supabase Row Level Security (RLS) enabled on all tables
- ✅ User authentication required for all protected routes
- ✅ Session-based authentication with automatic expiry

### Data Protection
- ✅ Input sanitization using DOMPurify
- ✅ SQL injection protection via Supabase parameterized queries
- ✅ XSS prevention on all user inputs
- ✅ Environment variables for sensitive data

### API Security
- ✅ HTTPS enforced in production
- ✅ Supabase anon key (safe for client-side)
- ❌ Rate limiting (TODO)
- ❌ CSRF protection (TODO)

### Dependencies
- ✅ Regular `npm audit` checks
- ✅ No known vulnerabilities
- ❌ Dependabot not yet configured (TODO)

## Best Practices for Contributors

### Never commit:
- ❌ API keys, tokens, or passwords
- ❌ `.env` files
- ❌ Private keys or certificates
- ❌ Database credentials

### Always:
- ✅ Use `.env.example` as a template
- ✅ Sanitize user inputs
- ✅ Validate data on both client and server
- ✅ Follow principle of least privilege
- ✅ Keep dependencies updated

## Security Checklist for New Features

Before merging new features, ensure:

- [ ] All user inputs are sanitized
- [ ] Database queries use Supabase's built-in protection
- [ ] RLS policies are properly configured
- [ ] No secrets are hardcoded
- [ ] Error messages don't leak sensitive information
- [ ] Authentication checks are in place
- [ ] HTTPS is enforced

## Known Limitations

1. **No rate limiting** - Frontend doesn't limit API request frequency
2. **No CSRF tokens** - Forms don't include CSRF protection
3. **No Content Security Policy** - No CSP headers configured
4. **No audit logging** - User actions aren't logged for security review

## Roadmap

- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Configure Content Security Policy
- [ ] Add security audit logging
- [ ] Set up Dependabot
- [ ] Implement 2FA option

## Contact

For security concerns: [Your contact method]

Last updated: 2024-10-22

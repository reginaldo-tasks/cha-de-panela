# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-15

### Added
- Initial Flask backend setup with SQLite database
- Authentication system with JWT tokens
- Couple management endpoints (GET, PUT)
- Gift CRUD operations (GET, POST, PUT, DELETE)
- Gift selection/purchase marking endpoint (POST /api/gifts/{id}/select)
- Gift reservation system
- CORS support for frontend communication
- Database seeding script with default test data
- Comprehensive API documentation
- Health check endpoint

### Features
- **Authentication**: Login and retrieve current user info with JWT tokens
- **Couple Management**: View and update couple information including:
  - List title and couple name
  - WhatsApp contact number
  - PIX payment key
  - Wedding date, biography, and images
- **Gifts Management**: Complete CRUD operations for gift items with:
  - Support for both `title` and `name` fields for compatibility
  - Support for both `imageUrl` and `image_url` fields for compatibility
  - Price, category, priority, and status tracking
  - URL references to gift sources
- **Public API**: Retrieve couple info and gifts without authentication
- **Protected API**: Manage couple data and gifts with JWT authentication

### Database
- SQLite database with two main tables:
  - `couples` - User accounts and couple information
  - `gifts` - Gift list items with status tracking

### Configuration
- Environment-based configuration (development, testing, production)
- CORS configuration for frontend integration
- Environment variables support via `.env` file

## Known Issues
- None documented yet

## Future Enhancements
- [ ] Guest list management
- [ ] RSVP tracking
- [ ] Email notifications
- [ ] Payment integration
- [ ] Image upload service
- [ ] Analytics and reporting
- [ ] Multi-language support

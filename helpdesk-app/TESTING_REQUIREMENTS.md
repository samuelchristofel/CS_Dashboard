# Testing Equipment Requirements: Vastel Helpdesk Application

---

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Dual-core processor | Quad-core processor |
| RAM | 4 GB | 8 GB |
| Storage | 10 GB free space | 20 GB free space |
| Display | 1280 x 720 resolution | 1920 x 1080 resolution |
| Network | Internet connection | Stable broadband |

---

## Software Requirements

### Operating System
| OS | Supported Versions |
|----|-------------------|
| Windows | 10, 11 |
| macOS | 12+ (Monterey or later) |
| Linux | Ubuntu 20.04+, Debian 11+ |

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.0+ | Runtime environment |
| npm | 9.0+ | Package manager |
| MySQL | 8.0+ | Database server |
| Git | 2.0+ | Version control |

### Web Browsers (for testing)
| Browser | Version |
|---------|---------|
| Google Chrome | Latest |
| Microsoft Edge | Latest |
| Opera | Latest |

### Development Tools (optional)
| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| MySQL Workbench / phpMyAdmin | Database management |
| Postman | API testing |

---

## Local Environment Setup

1. Install Node.js 18+
2. Install MySQL 8.0+
3. Create database `helpdesk_db`
4. Clone repository
5. Run `npm install`
6. Configure `.env` with database credentials
7. Run `npx prisma db push`
8. Run `npm run db:seed`
9. Run `npm run dev`
10. Open `http://localhost:3000` in browser

---

## Testing Tools

### API Testing
| Tool | Purpose |
|------|---------|
| Postman | Test API endpoints manually |
| Thunder Client (VS Code) | Lightweight API testing |

### Database Testing
| Tool | Purpose |
|------|---------|
| Prisma Studio | View/edit database records (`npx prisma studio`) |
| MySQL Workbench | Run SQL queries directly |
| phpMyAdmin | Web-based database management |

### Browser Developer Tools
| Tool | Purpose |
|------|---------|
| Chrome DevTools | Inspect network requests, console logs, elements |
| React Developer Tools | Debug React components and state |

### Manual Testing
| Method | What to Test |
|--------|--------------|
| Browser | All user flows (login, tickets, chat) |
| Multiple tabs | Test different roles simultaneously |
| Network throttling | Test slow connection behavior |

### Security Testing
| Tool | Purpose |
|------|---------|
| OWASP ZAP | Vulnerability scanning, brute force detection |
| Burp Suite | Intercept/modify requests, security testing |
| sqlmap | SQL injection testing |
| Hydra | Brute force password testing |
| npm audit | Check for vulnerable dependencies |

> **Note**: This project does not use automated testing frameworks (Jest, Cypress). All testing is done manually.

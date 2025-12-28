# Security Implementation Flowcharts

Visual guide to understanding the security enhancement implementation for Vastel HelpDesk.

---

## 1. Overall Implementation Timeline

```mermaid
graph TD
    Start[Start Security Implementation] --> Phase1[Phase 1: Critical Fixes<br/>3-4 days]
    
    Phase1 --> P1_1[Password Hashing<br/>bcrypt implementation]
    Phase1 --> P1_2[JWT Sessions<br/>Replace localStorage]
    Phase1 --> P1_3[Route Protection<br/>Middleware]
    Phase1 --> P1_4[Auth Checks<br/>API routes]
    
    P1_1 --> Phase1Complete{Phase 1<br/>Complete?}
    P1_2 --> Phase1Complete
    P1_3 --> Phase1Complete
    P1_4 --> Phase1Complete
    
    Phase1Complete -->|Yes| Phase2[Phase 2: High Priority<br/>2-3 days]
    Phase1Complete -->|No| Phase1
    
    Phase2 --> P2_1[Rate Limiting<br/>Upstash Redis]
    Phase2 --> P2_2[Input Validation<br/>Zod schemas]
    Phase2 --> P2_3[Env Validation<br/>Startup checks]
    
    P2_1 --> Phase2Complete{Phase 2<br/>Complete?}
    P2_2 --> Phase2Complete
    P2_3 --> Phase2Complete
    
    Phase2Complete -->|Yes| Phase3[Phase 3: Hardening<br/>2-3 days]
    Phase2Complete -->|No| Phase2
    
    Phase3 --> P3_1[Security Headers<br/>CSP, HSTS]
    Phase3 --> P3_2[Audit Logging<br/>Security events]
    Phase3 --> P3_3[Password Policies<br/>Strength requirements]
    
    P3_1 --> Deploy[Deploy to Production]
    P3_2 --> Deploy
    P3_3 --> Deploy
    
    Deploy --> Monitor[Monitor & Maintain]
    
    style Phase1 fill:#ff6b6b,color:#fff
    style Phase2 fill:#ffa500,color:#fff
    style Phase3 fill:#4ecdc4,color:#fff
    style Deploy fill:#95e1d3,color:#333
```

---

## 2. Authentication Flow - Before vs After

### Current (Insecure) Flow

```mermaid
sequenceDiagram
    participant User
    participant Login Page
    participant API
    participant Database
    participant Dashboard
    
    User->>Login Page: Enter email/password
    Login Page->>API: POST /api/auth/login<br/>(plain credentials)
    API->>Database: SELECT * WHERE email=?
    Database-->>API: User with plain password
    API->>API: Compare passwords<br/>(plain text ❌)
    
    alt Password matches
        API-->>Login Page: ✅ User data
        Login Page->>Login Page: localStorage.setItem('user')
        Login Page->>Dashboard: Redirect
        Note over Dashboard: Client checks localStorage<br/>No expiration ❌<br/>No server validation ❌
    else Password doesn't match
        API-->>Login Page: ❌ Invalid credentials
    end
```

### New (Secure) Flow

```mermaid
sequenceDiagram
    participant User
    participant Login Page
    participant API
    participant Database
    participant Dashboard
    participant Middleware
    
    User->>Login Page: Enter email/password
    Login Page->>API: POST /api/auth/login
    
    API->>API: Rate limit check<br/>(5 attempts/15min) ✅
    API->>API: Input validation<br/>(Zod schema) ✅
    API->>Database: SELECT * WHERE email=?
    Database-->>API: User with hashed password
    API->>API: bcrypt.compare()<br/>(secure hash) ✅
    
    alt Password valid
        API->>API: Generate JWT<br/>(expires in 24h) ✅
        API-->>Login Page: Set httpOnly cookie ✅
        Login Page->>Dashboard: Redirect to /dashboard
        Dashboard->>Middleware: Request page
        Middleware->>Middleware: Verify JWT ✅
        Middleware->>Middleware: Check role permissions ✅
        Middleware-->>Dashboard: Allow access
        Dashboard->>API: GET /api/auth/verify
        API-->>Dashboard: Current user data
    else Password invalid
        API->>Database: Log failed attempt ✅
        API-->>Login Page: ❌ Invalid credentials
    end
```

---

## 3. Request Protection Flow

```mermaid
graph TD
    Request[Incoming Request] --> IsProtected{Protected<br/>Route?}
    
    IsProtected -->|No /login, /public| Allow[Allow Direct Access]
    IsProtected -->|Yes /senior, /admin| CheckCookie{JWT Cookie<br/>Exists?}
    
    CheckCookie -->|No| Redirect1[Redirect to /login]
    CheckCookie -->|Yes| VerifyJWT{JWT Valid<br/>& Not Expired?}
    
    VerifyJWT -->|No| Redirect2[Redirect to /login]
    VerifyJWT -->|Yes| CheckRole{User Role<br/>Allowed?}
    
    CheckRole -->|No Junior→/admin| Redirect3[Redirect to<br/>User's Dashboard]
    CheckRole -->|Yes| APICall{API Route<br/>Request?}
    
    APICall -->|No Page Request| RenderPage[Render Page]
    APICall -->|Yes /api/*| ValidateInput{Input<br/>Valid?}
    
    ValidateInput -->|No| Return400[400 Bad Request]
    ValidateInput -->|Yes| CheckAuth{Authorized<br/>for Action?}
    
    CheckAuth -->|No| Return403[403 Forbidden]
    CheckAuth -->|Yes| ProcessRequest[Process Request]
    
    ProcessRequest --> LogActivity[Log to Activities]
    LogActivity --> ReturnResponse[Return Response]
    
    style Request fill:#e3f2fd
    style Redirect1 fill:#ffcdd2
    style Redirect2 fill:#ffcdd2
    style Redirect3 fill:#ffcdd2
    style Return400 fill:#ffe0b2
    style Return403 fill:#ffe0b2
    style ReturnResponse fill:#c8e6c9
```

---

## 4. Password Hashing Implementation Flow

```mermaid
graph LR
    subgraph User Creation
        A[New User<br/>Submitted] --> B[Validate Input<br/>Zod Schema]
        B --> C{Input Valid?}
        C -->|No| D[Return Error]
        C -->|Yes| E[Hash Password<br/>bcrypt.hash, 10 rounds]
        E --> F[Store in Database<br/>with hashed password]
    end
    
    subgraph Login Process
        G[User Enters<br/>Password] --> H[Fetch User<br/>from Database]
        H --> I[Get Hashed<br/>Password]
        I --> J[Compare<br/>bcrypt.compare]
        J --> K{Match?}
        K -->|Yes| L[Generate JWT]
        K -->|No| M[Return Error<br/>Log Attempt]
    end
    
    subgraph Migration
        N[Existing Users<br/>with Plain Passwords] --> O[Run Migration<br/>Script]
        O --> P[For Each User:<br/>Hash Password]
        P --> Q[Update Database<br/>with Hashed Password]
    end
    
    style E fill:#c8e6c9
    style J fill:#c8e6c9
    style L fill:#c8e6c9
    style M fill:#ffcdd2
    style D fill:#ffcdd2
```

---

## 5. JWT Session Management Flow

```mermaid
stateDiagram-v2
    [*] --> NotAuthenticated
    
    NotAuthenticated --> LoginAttempt: User submits login
    
    LoginAttempt --> RateLimitCheck: Check rate limit
    
    RateLimitCheck --> TooManyAttempts: > 5 attempts in 15min
    RateLimitCheck --> ValidateCredentials: Under limit
    
    TooManyAttempts --> NotAuthenticated: 429 Too Many Requests
    
    ValidateCredentials --> CredentialsInvalid: Wrong password
    ValidateCredentials --> GenerateJWT: Correct password
    
    CredentialsInvalid --> LogFailure: Log security event
    LogFailure --> NotAuthenticated: 401 Unauthorized
    
    GenerateJWT --> SetCookie: Create JWT (24h expiry)
    SetCookie --> Authenticated: Set httpOnly cookie
    
    Authenticated --> MakeRequest: User accesses pages/APIs
    
    MakeRequest --> MiddlewareCheck: Every request
    
    MiddlewareCheck --> TokenExpired: JWT expired
    MiddlewareCheck --> TokenInvalid: JWT tampered
    MiddlewareCheck --> TokenValid: JWT valid
    
    TokenExpired --> NotAuthenticated: Redirect to login
    TokenInvalid --> NotAuthenticated: Redirect to login
    
    TokenValid --> CheckPermissions: Verify role
    
    CheckPermissions --> Forbidden: Wrong role
    CheckPermissions --> Allowed: Correct role
    
    Forbidden --> Authenticated: Redirect to user's dashboard
    Allowed --> Authenticated: Process request
    
    Authenticated --> Logout: User clicks logout
    Logout --> ClearCookie: Delete auth cookie
    ClearCookie --> NotAuthenticated: Session ended
```

---

## 6. Input Validation Flow (Zod)

```mermaid
graph TD
    Input[User Input<br/>via API] --> ParseJSON[Parse JSON Body]
    
    ParseJSON --> Schema{Select Zod<br/>Schema}
    
    Schema --> LoginSchema[loginSchema]
    Schema --> TicketSchema[createTicketSchema]
    Schema --> UserSchema[createUserSchema]
    
    LoginSchema --> Validate1[Validate]
    TicketSchema --> Validate2[Validate]
    UserSchema --> Validate3[Validate]
    
    Validate1 --> Valid{Valid?}
    Validate2 --> Valid
    Validate3 --> Valid
    
    Valid -->|Yes| Sanitized[Sanitized Data]
    Valid -->|No| ErrorDetails[Extract Error<br/>Messages]
    
    ErrorDetails --> Return400[Return 400<br/>with clear message]
    
    Sanitized --> ProcessRequest[Process Request<br/>Safely]
    
    style Sanitized fill:#c8e6c9
    style Return400 fill:#ffcdd2
    style ProcessRequest fill:#c8e6c9
```

---

## 7. Rate Limiting Flow

```mermaid
graph TD
    Request[Login Request] --> GetIdentifier[Get Identifier<br/>IP or User ID]
    
    GetIdentifier --> CheckRedis{Check Redis<br/>Attempt Count}
    
    CheckRedis --> Under[< 5 attempts<br/>in 15 min]
    CheckRedis --> Over[≥ 5 attempts<br/>in 15 min]
    
    Over --> Block[Block Request<br/>429 Too Many Requests]
    Block --> WaitMessage[Return:<br/>Try again in X minutes]
    
    Under --> IncCounter[Increment Counter<br/>in Redis]
    IncCounter --> SetExpiry[Set Expiry<br/>15 minutes]
    SetExpiry --> AllowRequest[Allow Request<br/>Proceed to Auth]
    
    AllowRequest --> AuthSuccess{Auth<br/>Success?}
    
    AuthSuccess -->|Yes| ResetCounter[Reset Counter<br/>in Redis]
    AuthSuccess -->|No| KeepCounter[Keep Counter<br/>Track failures]
    
    style Block fill:#ffcdd2
    style WaitMessage fill:#ffcdd2
    style ResetCounter fill:#c8e6c9
    style AllowRequest fill:#c8e6c9
```

---

## 8. Middleware Authorization Decision Tree

```mermaid
graph TD
    Start[Request Arrives] --> Path{Route Path}
    
    Path -->|/login, /public| NoAuth[No Auth Required<br/>Allow Access]
    Path -->|/senior/*| RequireAuth[Authentication<br/>Required]
    Path -->|/junior/*| RequireAuth
    Path -->|/it/*| RequireAuth
    Path -->|/admin/*| RequireAuth
    
    RequireAuth --> Cookie{JWT Cookie<br/>Present?}
    
    Cookie -->|No| LoginRedirect[302 Redirect<br/>/login]
    Cookie -->|Yes| Verify{JWT<br/>Valid?}
    
    Verify -->|No Expired| LoginRedirect
    Verify -->|No Tampered| LoginRedirect
    Verify -->|Yes| ExtractRole[Extract User Role<br/>from JWT Payload]
    
    ExtractRole --> RoleCheck{Check Role<br/>Permissions}
    
    RoleCheck -->|Admin| AdminCheck[Check Path]
    RoleCheck -->|Senior| SeniorCheck[Check Path]
    RoleCheck -->|Junior| JuniorCheck[Check Path]
    RoleCheck -->|IT| ITCheck[Check Path]
    
    AdminCheck --> AdminAllow{Path in<br/>/admin /senior<br/>/junior /it?}
    SeniorCheck --> SeniorAllow{Path in<br/>/senior?}
    JuniorCheck --> JuniorAllow{Path in<br/>/junior?}
    ITCheck --> ITAllow{Path in<br/>/it?}
    
    AdminAllow -->|Yes| Allow[✅ Allow<br/>Render Page]
    SeniorAllow -->|Yes| Allow
    JuniorAllow -->|Yes| Allow
    ITAllow -->|Yes| Allow
    
    AdminAllow -->|No| DashboardRedirect[302 Redirect<br/>to /admin]
    SeniorAllow -->|No| DashboardRedirect2[302 Redirect<br/>to /senior]
    JuniorAllow -->|No| DashboardRedirect3[302 Redirect<br/>to /junior]
    ITAllow -->|No| DashboardRedirect4[302 Redirect<br/>to /it]
    
    style Allow fill:#c8e6c9
    style LoginRedirect fill:#ffcdd2
    style DashboardRedirect fill:#ffe0b2
    style DashboardRedirect2 fill:#ffe0b2
    style DashboardRedirect3 fill:#ffe0b2
    style DashboardRedirect4 fill:#ffe0b2
```

---

## 9. Security Audit Logging Flow

```mermaid
graph LR
    Event[Security Event<br/>Occurs] --> Type{Event Type}
    
    Type -->|Login Success| Success[Capture:<br/>user_id, ip, timestamp]
    Type -->|Login Failure| Failure[Capture:<br/>email, ip, user_agent]
    Type -->|Password Change| PwChange[Capture:<br/>user_id, ip]
    Type -->|Unauthorized Access| UnAuth[Capture:<br/>user_id, path, ip]
    
    Success --> Structure[Build Log Entry]
    Failure --> Structure
    PwChange --> Structure
    UnAuth --> Structure
    
    Structure --> Insert[Insert to<br/>activities Table]
    
    Insert --> Alert{Critical<br/>Event?}
    
    Alert -->|Yes| Notify[Send Alert<br/>to Admins]
    Alert -->|No| Store[Store for<br/>Review]
    
    Notify --> Store
    
    Store --> Analyze[Available for:<br/>Security Analysis<br/>Forensics<br/>Compliance]
    
    style Alert fill:#ffe0b2
    style Notify fill:#ffcdd2
    style Analyze fill:#c8e6c9
```

---

## 10. Complete Security Stack Visualization

```mermaid
graph TB
    subgraph Client Browser
        User[User] --> LoginUI[Login Page]
        LoginUI --> Dashboard[Dashboard]
    end
    
    subgraph Next.js Middleware Layer
        Middleware[Middleware.ts<br/>✅ JWT Verification<br/>✅ Role Check]
    end
    
    subgraph API Layer
        API1["/api/auth/login<br/>✅ Rate Limit<br/>✅ Input Validation<br/>✅ bcrypt Compare"]
        API2["/api/tickets<br/>✅ Auth Check<br/>✅ Input Validation<br/>✅ Authorization"]
        API3["/api/users<br/>✅ Admin Only<br/>✅ Input Validation<br/>✅ Password Hash"]
    end
    
    subgraph Database Layer
        DB[(Supabase<br/>✅ Hashed Passwords<br/>✅ RLS Policies<br/>✅ Audit Logs)]
    end
    
    subgraph External Services
        Redis[Upstash Redis<br/>Rate Limiting]
        Monitor[Security<br/>Monitoring]
    end
    
    User --> Middleware
    Middleware --> Dashboard
    Middleware --> API1
    Middleware --> API2
    Middleware --> API3
    
    API1 --> Redis
    API1 --> DB
    API2 --> DB
    API3 --> DB
    
    API1 --> Monitor
    API2 --> Monitor
    API3 --> Monitor
    
    style Middleware fill:#4ecdc4
    style API1 fill:#95e1d3
    style API2 fill:#95e1d3
    style API3 fill:#95e1d3
    style DB fill:#ffd93d
    style Redis fill:#ff6b6b
    style Monitor fill:#c8e6c9
```

---

## Key Takeaways

### Color Legend
- 🔴 **Red/Pink**: Errors, blocks, failures, unauthorized
- 🟠 **Orange**: Warnings, redirects, less critical issues
- 🟢 **Green**: Success, allowed, secure operations
- 🔵 **Blue**: Information, neutral states
- 🟡 **Yellow**: Data storage, important resources

### Implementation Priority
1. **Phase 1 (Red)**: Critical security fixes - foundation of all other improvements
2. **Phase 2 (Orange)**: High-priority hardening - prevents common attacks
3. **Phase 3 (Teal)**: Production hardening - defense in depth

### Flow Summary
- **Before**: Simple but insecure (plain passwords, localStorage, no protection)
- **After**: Multi-layered security (hashing, JWT, middleware, validation, logging)

For detailed implementation code and steps, refer to [`implementation_plan.md`](file:///C:/Users/hp/.gemini/antigravity/brain/e852d4c2-1acc-4c7e-943f-56e13200ab44/implementation_plan.md).

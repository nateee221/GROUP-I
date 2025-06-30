GROUP I
**LGU Asset Tracking System**

A comprehensive asset management system designed for Local Government Units (LGUs) to efficiently track, manage, and monitor their assets, assignments, transfers, and maintenance records.

### Features

#### Core Functionality

- Asset Management: Complete CRUD operations for assets with detailed tracking
- User Management: Role-based access control (Admin, Department Head, Staff)
- Assignment Tracking: Monitor asset assignments and returns
- Transfer Management: Handle asset transfers between departments
- Maintenance Records: Schedule and track maintenance activities
- Audit Logging: Complete audit trail for all system activities
- Dashboard Analytics: Visual insights with charts and statistics

#### Advanced Features

- Multi-Database Support: Works with both Supabase and localStorage fallback
- Responsive Design: Mobile-friendly interface using Tailwind CSS
- Dark/Light Mode: Theme switching capability
- Multi-language Support: Internationalization ready
- Real-time Updates: Live data synchronization
- Export Capabilities: Generate reports and export data
- Email Notifications: Automated email alerts for important events

### Technology Stack

- Frontend: Next.js 14, React, TypeScript
- Styling: Tailwind CSS, shadcn/ui components
- Database: Supabase (PostgreSQL) with localStorage fallback
- Authentication: Custom authentication system
- Charts: Recharts for data visualization
- Email: SMTP integration for notifications
- Icons: Lucide React

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional - system works with localStorage)
- SMTP server for email notifications (optional)

### Quick Start

1. Clone the Repository

```bash
git clone <repository-url>
cd asset-tracking-system
```

2. Install Dependencies

```bash
npm install
# or
yarn install
```

3. Environment Setup\
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
NEXT_PUBLIC_APP_URL=http://localhost:3000  
SMTP_HOST=your_smtp_host  
SMTP_PORT=587  
SMTP_USER=your_smtp_username  
SMTP_PASSWORD=your_smtp_password  
FROM_EMAIL=noreply@yourdomain.com  
```

4. Database Setup (Optional)\
   Run SQL scripts if using Supabase:

- `scripts/consolidated-schema-fixed.sql`
- `scripts/consolidated-seed-fixed.sql`
- `scripts/create-account-requests-table-fixed.sql`

5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

| Role            | Email                                  | Password | Department         |
| --------------- | -------------------------------------- | -------- | ------------------ |
| Admin           | [admin@lgu.gov](mailto\:admin@lgu.gov) | admin123 | IT Department      |
| Department Head | [head@lgu.gov](mailto\:head@lgu.gov)   | head123  | Finance Department |
| Staff           | [staff@lgu.gov](mailto\:staff@lgu.gov) | staff123 | General Services   |

### Project Structure

```
├── app/                  
│   ├── api/              
│   ├── dashboard/        
│   ├── assets/           
│   ├── users/            
├── components/            
│   ├── ui/               
│   ├── charts/           
├── lib/                  
│   ├── unified-database.ts
│   ├── api-client.ts     
├── types/                
├── scripts/              
└── public/               
```

### Database Schema

Core Tables:

- users
- assets
- assignments
- transfers
- maintenance\_records
- departments
- audit\_logs
- account\_requests

### Configuration

- Supabase Mode: Cloud database with real-time support
- localStorage Mode: Browser-based offline fallback

SMTP is required for sending email alerts and notifications.

### Features Overview

**Asset Management**

- Add, edit, delete, and categorize assets
- Track asset lifecycle, status, and location

**User Management**

- Role-based access
- Activity logging and department assignments

**Assignment System**

- Assign and return assets
- Track overdue assets

**Transfer Management**

- Approve and record inter-department transfers

**Maintenance Tracking**

- Schedule and track repairs
- View maintenance history

**Reporting & Analytics**

- Generate reports
- View visual charts and department stats

### Deployment

**Using Vercel**

- Push to GitHub
- Connect to Vercel
- Set environment variables
- Deploy

**Manual Deployment**

```bash
npm run build
npm start
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a pull request

### API Documentation

**Authentication**

- POST `/api/auth/login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`

**Resources**

- GET `/api/assets`
- POST `/api/assets`
- PUT `/api/assets/[id]`
- DELETE `/api/assets/[id]`
- Similar endpoints for users, assignments, transfers, etc.

### Troubleshooting

**Database Issues**

- Check Supabase settings
- Use localStorage as fallback

**Email Issues**

- Verify SMTP settings
- Confirm credentials

**Permissions**

- Check user role
- Review audit logs

### License

MIT License

### Support

- Submit issues on GitHub
- Contact the dev team
- Refer to documentation

### Version History

- v1.0.0 – Core features
- v1.1.0 – Notifications and reporting
- v1.2.0 – UI/UX improvements

Built for Local Government Units.


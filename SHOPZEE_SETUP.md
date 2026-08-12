# Shopzee — Setup Guide

## Folder Structure
```
F:\shopzee1\
├── image\              ← Original images & videos
├── frontend\
│   └── shopzee-frontend\  ← Angular 19 app
└── backend\
    └── Shopzee.API\    ← .NET 9 Web API
```

## Start Backend
```powershell
cd F:\shopzee1\backend\Shopzee.API
dotnet run --launch-profile http
# Runs at: http://localhost:5112
# Swagger: http://localhost:5112/swagger
```

## Start Frontend
```powershell
cd F:\shopzee1\frontend\shopzee-frontend
ng serve
# Runs at: http://localhost:4200
```

## Demo Credentials
| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@shopzee.pk         | Admin@123   |
| Customer | ayesha@shopzee.pk        | User@123    |

## All API Endpoints

### Public
| Method | URL                              | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/products                    | List products (filter)|
| GET    | /api/products/featured           | Featured products     |
| GET    | /api/products/{id}               | Product detail        |
| GET    | /api/products/slug/{slug}        | By slug               |
| GET    | /api/products/{id}/related       | Related products      |
| GET    | /api/products/categories         | All categories        |
| POST   | /api/auth/register               | Register              |
| POST   | /api/auth/login                  | Login → JWT token     |

### Authenticated (Bearer Token)
| Method | URL                              | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/auth/me                     | Current user          |
| PUT    | /api/auth/profile                | Update profile        |
| PUT    | /api/auth/change-password        | Change password       |
| GET    | /api/cart                        | Get cart              |
| POST   | /api/cart/items                  | Add to cart           |
| PUT    | /api/cart/items/{id}             | Update quantity       |
| DELETE | /api/cart/items/{id}             | Remove item           |
| DELETE | /api/cart                        | Clear cart            |
| GET    | /api/orders                      | My orders             |
| POST   | /api/orders                      | Place order           |
| GET    | /api/orders/{id}                 | Order detail          |
| GET    | /api/wishlist                    | My wishlist           |
| POST   | /api/wishlist/{productId}        | Toggle wishlist       |
| DELETE | /api/wishlist/{productId}        | Remove from wishlist  |

### Admin Only
| Method | URL                              | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/admin/dashboard             | Dashboard stats       |
| GET    | /api/admin/customers             | All customers         |
| PUT    | /api/admin/customers/{id}/toggle | Enable/disable user   |
| GET    | /api/admin/analytics             | Analytics data        |
| GET    | /api/orders/admin/all            | All orders            |
| PUT    | /api/orders/admin/{id}/status    | Update order status   |
| POST   | /api/products                    | Create product        |
| PUT    | /api/products/{id}               | Update product        |
| DELETE | /api/products/{id}               | Soft delete product   |
| PUT    | /api/products/{id}/seo           | Update SEO data       |

## Tech Stack
- **Frontend:** Angular 19, Signals, SCSS, GSAP
- **Backend:** .NET 9 Web API, EF Core, SQLite
- **Auth:** JWT Bearer tokens
- **Database:** SQLite (shopzee.db — auto-created on first run)

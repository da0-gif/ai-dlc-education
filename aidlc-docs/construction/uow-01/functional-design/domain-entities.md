# Domain Entities - UOW-01

## Entity Relationship

```
Store 1──N Admin
Store 1──N Category
Store 1──N Table
Store 1──N DailySales
Category 1──N Menu
Table 1──N Session
Session 1──N Order
Session 0..1 Parking
Order 1──N OrderItem
OrderItem N──1 Menu
Session 1──N OrderHistory (이용 완료 시 이동)
```

---

## Entities

### Store (매장)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| name | String | NOT NULL |
| slug | String | UNIQUE, NOT NULL (매장 식별자) |
| address | String | nullable |
| phone | String | nullable |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

### Admin (관리자)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| store_id | UUID | FK → Store |
| username | String | NOT NULL, UNIQUE per store |
| password_hash | String | NOT NULL (bcrypt) |
| created_at | DateTime | NOT NULL |

### Category (카테고리)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| store_id | UUID | FK → Store |
| name | String | NOT NULL |
| sort_order | Integer | NOT NULL, default 0 |
| created_at | DateTime | NOT NULL |

### Menu (메뉴)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| category_id | UUID | FK → Category |
| store_id | UUID | FK → Store |
| name | String | NOT NULL |
| price | Integer | NOT NULL, > 0 |
| description | String | nullable |
| image_url | String | nullable |
| sort_order | Integer | NOT NULL, default 0 |
| is_sold_out | Boolean | NOT NULL, default false |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

### Table (테이블)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| store_id | UUID | FK → Store |
| table_number | Integer | NOT NULL, UNIQUE per store |
| password | String | NOT NULL |
| created_at | DateTime | NOT NULL |

### Session (세션)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| table_id | UUID | FK → Table |
| store_id | UUID | FK → Store |
| started_at | DateTime | NOT NULL |
| ended_at | DateTime | nullable (이용 완료 시 설정) |
| is_active | Boolean | NOT NULL, default true |

### Order (주문)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| session_id | UUID | FK → Session |
| store_id | UUID | FK → Store |
| table_id | UUID | FK → Table |
| order_number | Integer | NOT NULL, auto-increment per store per day |
| status | Enum | NOT NULL (PENDING/PREPARING/COMPLETED) |
| total_amount | Integer | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

### OrderItem (주문 항목)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| order_id | UUID | FK → Order |
| menu_id | UUID | FK → Menu |
| menu_name | String | NOT NULL (주문 시점 스냅샷) |
| quantity | Integer | NOT NULL, > 0 |
| unit_price | Integer | NOT NULL (주문 시점 스냅샷) |
| subtotal | Integer | NOT NULL |

### OrderHistory (주문 이력)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| store_id | UUID | FK → Store |
| table_id | UUID | FK → Table |
| session_id | UUID | 원본 Session ID |
| order_data | JSON | NOT NULL (주문 전체 스냅샷) |
| total_amount | Integer | NOT NULL |
| completed_at | DateTime | NOT NULL (이용 완료 시각) |

### Parking (주차)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| session_id | UUID | FK → Session, UNIQUE |
| store_id | UUID | FK → Store |
| plate_number | String | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

### DailySales (일별 매출)
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| store_id | UUID | FK → Store |
| sales_date | Date | NOT NULL |
| total_amount | Integer | NOT NULL |
| order_count | Integer | NOT NULL |
| closed_at | DateTime | NOT NULL (일마감 시각) |
| created_at | DateTime | NOT NULL |

**UNIQUE**: (store_id, sales_date)

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  icon: string;
}

export const diagramTemplates: DiagramTemplate[] = [
  // Flowchart Templates
  {
    id: "basic-flowchart",
    name: "Basic Flowchart",
    description: "Simple decision-based flowchart",
    category: "Flowchart",
    icon: "🔄",
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`
  },
  {
    id: "process-flow",
    name: "Process Flow",
    description: "Multi-step process workflow",
    category: "Flowchart",
    icon: "⚙️",
    code: `graph TD
    A[Input] --> B[Process 1]
    B --> C[Process 2]
    C --> D{Quality Check}
    D -->|Pass| E[Output]
    D -->|Fail| F[Rework]
    F --> B`
  },
  {
    id: "user-journey",
    name: "User Journey",
    description: "User experience flow",
    category: "Flowchart",
    icon: "👤",
    code: `graph TD
    A[User Visits] --> B[Browse Products]
    B --> C{Find Product?}
    C -->|Yes| D[Add to Cart]
    C -->|No| E[Search]
    E --> B
    D --> F[Checkout]
    F --> G[Payment]
    G --> H[Order Complete]`
  },

  // Sequence Diagrams
  {
    id: "api-sequence",
    name: "API Sequence",
    description: "API request/response flow",
    category: "Sequence",
    icon: "🔗",
    code: `sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: Request
    API->>Database: Query
    Database-->>API: Result
    API-->>Client: Response`
  },
  {
    id: "user-auth",
    name: "User Authentication",
    description: "Login sequence flow",
    category: "Sequence",
    icon: "🔐",
    code: `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: Login request
    Backend->>Database: Validate user
    Database-->>Backend: User data
    Backend-->>Frontend: JWT token
    Frontend-->>User: Login success`
  },

  // Class Diagrams
  {
    id: "basic-class",
    name: "Basic Class",
    description: "Simple class structure",
    category: "Class",
    icon: "📦",
    code: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Product {
        +String title
        +Number price
        +getDetails()
    }
    
    User --> Product : purchases`
  },
  {
    id: "inheritance",
    name: "Inheritance Model",
    description: "Class inheritance example",
    category: "Class",
    icon: "🏗️",
    code: `classDiagram
    class Animal {
        +String name
        +eat()
        +sleep()
    }
    
    class Dog {
        +bark()
        +fetch()
    }
    
    class Cat {
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`
  },

  // Gantt Charts
  {
    id: "project-timeline",
    name: "Project Timeline",
    description: "Project management timeline",
    category: "Gantt",
    icon: "📅",
    code: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :done, req, 2024-01-01, 2024-01-15
    Design         :done, design, after req, 20d
    section Development
    Frontend       :active, frontend, 2024-02-01, 30d
    Backend        :backend, after frontend, 25d
    section Testing
    QA Testing     :testing, after backend, 15d
    Deployment     :deploy, after testing, 5d`
  },

  // State Diagrams
  {
    id: "order-states",
    name: "Order States",
    description: "Order lifecycle states",
    category: "State",
    icon: "🔄",
    code: `stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : payment_received
    Processing --> Shipped : items_packed
    Shipped --> Delivered : package_delivered
    Delivered --> [*]
    
    Processing --> Cancelled : cancel_order
    Pending --> Cancelled : payment_failed
    Cancelled --> [*]`
  },

  // Git Diagrams
  {
    id: "git-flow",
    name: "Git Flow",
    description: "Git branching strategy",
    category: "Git",
    icon: "🌿",
    code: `gitgraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature 1"
    branch feature
    checkout feature
    commit id: "Work"
    checkout develop
    merge feature
    checkout main
    merge develop
    commit id: "Release"`
  },

  // ER Diagrams
  {
    id: "database-er",
    name: "Database ER",
    description: "Entity relationship diagram",
    category: "ER",
    icon: "🗄️",
    code: `erDiagram
    USER {
        int id PK
        string name
        string email
        datetime created_at
    }
    
    ORDER {
        int id PK
        int user_id FK
        decimal total
        datetime order_date
    }
    
    PRODUCT {
        int id PK
        string name
        decimal price
        text description
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
    
    USER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : included_in`
  }
];

export const templateCategories = [
  "All",
  "Flowchart",
  "Sequence", 
  "Class",
  "Gantt",
  "State",
  "Git",
  "ER"
];

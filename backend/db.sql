CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    join_date TEXT NOT NULL,
    role TEXT NOT NULL
);

INSERT INTO users (user_id, username, email, password_hash, join_date, role) VALUES
('user_001', 'john_doe', 'john@example.com', 'hashedpassword1', '2023-10-01', 'blogger'),
('user_002', 'jane_smith', 'jane@example.com', 'hashedpassword2', '2023-10-02', 'designer'),
('user_003', 'mike_brown', 'mike@example.com', 'hashedpassword3', '2023-10-03', 'business_owner');

CREATE TABLE templates (
    template_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    preview_url TEXT NOT NULL
);

INSERT INTO templates (template_id, name, category, preview_url) VALUES
('template_001', 'Modern Blog', 'blog', 'https://picsum.photos/seed/blog/200/300'),
('template_002', 'Creative Portfolio', 'portfolio', 'https://picsum.photos/seed/portfolio/200/300'),
('template_003', 'Business Classic', 'business', 'https://picsum.photos/seed/business/200/300');

CREATE TABLE sites (
    site_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    domain_name TEXT UNIQUE,
    color_scheme TEXT,
    fonts TEXT,
    date_created TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (template_id) REFERENCES templates(template_id)
);

INSERT INTO sites (site_id, user_id, template_id, domain_name, color_scheme, fonts, date_created) VALUES
('site_001', 'user_001', 'template_001', 'johndoeblog.com', 'dark', 'Arial', '2023-10-04'),
('site_002', 'user_002', 'template_002', 'janesmithdesigns.com', 'light', 'Helvetica', '2023-10-05'),
('site_003', 'user_003', 'template_003', NULL, NULL, NULL, '2023-10-06');

CREATE TABLE pages (
    page_id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content JSON,
    seo_meta JSON,
    FOREIGN KEY (site_id) REFERENCES sites(site_id)
);

INSERT INTO pages (page_id, site_id, type, title, content, seo_meta) VALUES
('page_001', 'site_001', 'home', 'Welcome to My Blog', '{"header": "Welcome", "body": "This is my first post"}', '{"title": "Welcome", "description": "John\'s Blog"}'),
('page_002', 'site_002', 'portfolio', 'My Works', '{"projects": ["Project 1", "Project 2"]}', '{"title": "My Portfolio", "keywords": "design, creative"}');

CREATE TABLE blog_posts (
    post_id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT,
    comments_count INTEGER DEFAULT 0,
    FOREIGN KEY (site_id) REFERENCES sites(site_id)
);

INSERT INTO blog_posts (post_id, site_id, title, body, publish_date, status, category, comments_count) VALUES
('post_001', 'site_001', 'Getting Started', 'This is a blog post about getting started...', '2023-10-07', 'published', 'tutorial', 5);

CREATE TABLE portfolio_items (
    item_id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(site_id)
);

INSERT INTO portfolio_items (item_id, site_id, title, image_url, description, tags) VALUES
('item_001', 'site_002', 'Logo Design', 'https://picsum.photos/seed/logo/200/300', 'A creative logo design for a startup.', 'logo, design, branding');

CREATE TABLE comments (
    comment_id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES blog_posts(post_id)
);

INSERT INTO comments (comment_id, post_id, author_name, author_email, content, publish_date) VALUES
('comment_001', 'post_001', 'Alice Cooper', 'alice@example.com', 'Great post, really enjoyed it!', '2023-10-08');

CREATE TABLE contact_submissions (
    submission_id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    submission_date TEXT NOT NULL,
    FOREIGN KEY (site_id) REFERENCES sites(site_id)
);

INSERT INTO contact_submissions (submission_id, site_id, name, email, message, submission_date) VALUES
('submission_001', 'site_003', 'David Smith', 'david@company.com', 'Looking forward to our collaboration.', '2023-10-09');
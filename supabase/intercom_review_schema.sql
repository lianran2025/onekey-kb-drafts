create table if not exists public.intercom_articles (
  id bigserial primary key,
  article_id text not null unique,
  title text,
  collection_id text,
  collection_path_label text,
  state text,
  public_url text,
  updated_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_intercom_articles_updated_at on public.intercom_articles(updated_at);
create index if not exists idx_intercom_articles_collection_id on public.intercom_articles(collection_id);
create index if not exists idx_intercom_articles_state on public.intercom_articles(state);

create table if not exists public.intercom_article_reviews (
  id bigserial primary key,
  article_id text not null unique references public.intercom_articles(article_id) on delete cascade,
  review_status text not null default 'pending',
  review_note text,
  last_reviewed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intercom_article_reviews_status on public.intercom_article_reviews(review_status);
create index if not exists idx_intercom_article_reviews_last_reviewed_at on public.intercom_article_reviews(last_reviewed_at);

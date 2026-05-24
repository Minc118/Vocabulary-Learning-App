-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables to avoid conflicts and cache mismatches
DROP TABLE IF EXISTS public.word_tags CASCADE;
DROP TABLE IF EXISTS public.examples CASCADE;
DROP TABLE IF EXISTS public.collocations CASCADE;
DROP TABLE IF EXISTS public.synonyms CASCADE;
DROP TABLE IF EXISTS public.words CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.imported_text CASCADE;

-- Collections table
create table public.collections (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tags table
create table public.tags (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    color text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint tags_name_user_unique unique (name, user_id)
);

-- Words table
create table public.words (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    word text not null,
    translation text,
    pos text,
    language text not null,
    definition text,
    source text,
    collection_id uuid references public.collections(id) on delete set null,
    mastery text default 'Learning',
    review_count int default 0,
    next_review timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WordTags junction table
create table public.word_tags (
    word_id uuid references public.words(id) on delete cascade not null,
    tag_id uuid references public.tags(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    primary key (word_id, tag_id)
);

-- Examples table
create table public.examples (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    word_id uuid references public.words(id) on delete cascade not null,
    sentence text not null,
    translation text,
    source text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collocations table
create table public.collocations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    word_id uuid references public.words(id) on delete cascade not null,
    phrase text not null
);

-- Synonyms table
create table public.synonyms (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    word_id uuid references public.words(id) on delete cascade not null,
    related_word text not null,
    relation_type text not null check (relation_type in ('synonym', 'antonym', 'related'))
);

-- ImportedText table
create table public.imported_text (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    title text,
    raw_text text not null,
    language text not null,
    source_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.collections enable row level security;
alter table public.tags enable row level security;
alter table public.words enable row level security;
alter table public.word_tags enable row level security;
alter table public.examples enable row level security;
alter table public.collocations enable row level security;
alter table public.synonyms enable row level security;
alter table public.imported_text enable row level security;

-- Create RLS Policies

-- Collections policies
create policy "Users can view their own collections" on public.collections for select using (auth.uid() = user_id);
create policy "Users can insert their own collections" on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update their own collections" on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete their own collections" on public.collections for delete using (auth.uid() = user_id);

-- Tags policies
create policy "Users can view their own tags" on public.tags for select using (auth.uid() = user_id);
create policy "Users can insert their own tags" on public.tags for insert with check (auth.uid() = user_id);
create policy "Users can update their own tags" on public.tags for update using (auth.uid() = user_id);
create policy "Users can delete their own tags" on public.tags for delete using (auth.uid() = user_id);

-- Words policies
create policy "Users can view their own words" on public.words for select using (auth.uid() = user_id);
create policy "Users can insert their own words" on public.words for insert with check (auth.uid() = user_id);
create policy "Users can update their own words" on public.words for update using (auth.uid() = user_id);
create policy "Users can delete their own words" on public.words for delete using (auth.uid() = user_id);

-- WordTags policies
create policy "Users can view their own word_tags" on public.word_tags for select using (auth.uid() = user_id);
create policy "Users can insert their own word_tags" on public.word_tags for insert with check (auth.uid() = user_id);
create policy "Users can delete their own word_tags" on public.word_tags for delete using (auth.uid() = user_id);

-- Examples policies
create policy "Users can view their own examples" on public.examples for select using (auth.uid() = user_id);
create policy "Users can insert their own examples" on public.examples for insert with check (auth.uid() = user_id);
create policy "Users can update their own examples" on public.examples for update using (auth.uid() = user_id);
create policy "Users can delete their own examples" on public.examples for delete using (auth.uid() = user_id);

-- Collocations policies
create policy "Users can view their own collocations" on public.collocations for select using (auth.uid() = user_id);
create policy "Users can insert their own collocations" on public.collocations for insert with check (auth.uid() = user_id);
create policy "Users can update their own collocations" on public.collocations for update using (auth.uid() = user_id);
create policy "Users can delete their own collocations" on public.collocations for delete using (auth.uid() = user_id);

-- Synonyms policies
create policy "Users can view their own synonyms" on public.synonyms for select using (auth.uid() = user_id);
create policy "Users can insert their own synonyms" on public.synonyms for insert with check (auth.uid() = user_id);
create policy "Users can update their own synonyms" on public.synonyms for update using (auth.uid() = user_id);
create policy "Users can delete their own synonyms" on public.synonyms for delete using (auth.uid() = user_id);

-- ImportedText policies
create policy "Users can view their own imported_text" on public.imported_text for select using (auth.uid() = user_id);
create policy "Users can insert their own imported_text" on public.imported_text for insert with check (auth.uid() = user_id);
create policy "Users can update their own imported_text" on public.imported_text for update using (auth.uid() = user_id);
create policy "Users can delete their own imported_text" on public.imported_text for delete using (auth.uid() = user_id);

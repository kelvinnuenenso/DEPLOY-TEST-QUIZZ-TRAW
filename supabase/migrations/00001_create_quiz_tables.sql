-- Create profiles table to store additional user information
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create RLS policies for profiles
alter table public.profiles enable row level security;
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create quizzes table
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for quizzes
alter table public.quizzes enable row level security;
create policy "Users can view their own quizzes."
  on public.quizzes for select
  using ( auth.uid() = user_id );

create policy "Users can create their own quizzes."
  on public.quizzes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own quizzes."
  on public.quizzes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own quizzes."
  on public.quizzes for delete
  using ( auth.uid() = user_id );

-- Create questions table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  question_text text not null,
  question_type text default 'multiple_choice' check (question_type in ('multiple_choice', 'true_false', 'open_ended')),
  correct_answer text,
  options jsonb,
  points integer default 1,
  order_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for questions
alter table public.questions enable row level security;
create policy "Users can view questions of their quizzes."
  on public.questions for select
  using ( auth.uid() in (select user_id from public.quizzes where id = quiz_id) );

create policy "Users can create questions in their quizzes."
  on public.questions for insert
  with check ( auth.uid() in (select user_id from public.quizzes where id = quiz_id) );

create policy "Users can update questions in their quizzes."
  on public.questions for update
  using ( auth.uid() in (select user_id from public.quizzes where id = quiz_id) );

create policy "Users can delete questions in their quizzes."
  on public.questions for delete
  using ( auth.uid() in (select user_id from public.quizzes where id = quiz_id) );

-- Create quiz_results table
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  user_id uuid references auth.users on delete set null,
  score integer not null,
  max_score integer not null,
  answers jsonb not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for quiz_results
alter table public.quiz_results enable row level security;
create policy "Users can view their own quiz results."
  on public.quiz_results for select
  using ( auth.uid() = user_id );

create policy "Users can create their own quiz results."
  on public.quiz_results for insert
  with check ( auth.uid() = user_id );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
 returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.quizzes
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.questions
  for each row
  execute function public.handle_updated_at();
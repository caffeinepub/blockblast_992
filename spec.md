# BlockBlast - Technical Specification

## Overview

BlockBlast is a barebones dapp scaffolding for building Internet Computer applications. It provides the minimal structure needed to get started with IC development using React, TypeScript, and Motoko.

## Authentication System

- Uses Internet Identity for authentication
- Supports login/logout flow
- Handles identity persistence across sessions

## User Access

- Anonymous users can view the landing page
- Authenticated users access the main application

## Core Features

- Internet Identity authentication
- Basic app layout with header
- Toast notifications
- Query caching with React Query

## Backend Data Storage

### Data Models

```motoko
type UserData = {
  id : Nat;
  owner : Principal;
  createdAt : Time.Time;
};

```

## Backend Operations

### Public Functions

- `greet(name: Text) : async Text` - Returns a greeting message
- `whoami() : async Principal` - Returns the caller's principal

## User Interface

### Layout

- Landing page for unauthenticated users
- Main app shell for authenticated users
- Loading screen during initialization

### Components

- LandingPage: Welcome page with login button
- LoadingScreen: Spinner during auth initialization
- Header: App header with logout button

## Design System

### Colors

- Primary: #3B82F6 (blue)
- Background: #F8F9FA
- Text Primary: #1A1A1A
- Text Secondary: #6B7280

### Typography

- Font Family: Inter, system-ui, sans-serif
- Headings: 600 weight
- Body: 400 weight

## State Management

- React Query for server state
- React hooks for local state
- Identity context via useInternetIdentity hook

## Data Flow

1. User authenticates via Internet Identity
2. Actor is created with authenticated identity
3. Queries fetch data from backend canister
4. Mutations update backend and invalidate queries

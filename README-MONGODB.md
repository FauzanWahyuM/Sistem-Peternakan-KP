# MongoDB Setup Guide

This application uses MongoDB as its database. Follow these instructions to set up MongoDB properly.

## Prerequisites

1. Install MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Or use MongoDB Atlas (cloud MongoDB service)

## Local MongoDB Installation (Windows)

1. Download and install MongoDB Community Server
2. Create a data directory: `mkdir C:\data\db`
3. Start MongoDB service: `mongod`
4. MongoDB will run on the default port 27017

## Environment Configuration

The application automatically creates a `.env.local` file with default MongoDB settings:

```
MONGODB_URI=mongodb://localhost:27017/simantek
MONGODB_DB=simantek
```

If you're using MongoDB Atlas, uncomment and modify the following line in `.env.local`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek
```

For Vercel deployment, you'll need to set these environment variables in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simantek
MONGODB_DB=simantek
NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
```

## Troubleshooting

If you encounter connection issues:

1. Ensure MongoDB is running on your system
2. Check that the `MONGODB_URI` in `.env.local` is correct
3. Verify that your firewall isn't blocking MongoDB connections
4. If using MongoDB Atlas, ensure your IP address is whitelisted

## Collections

The application uses the following collections:
- `users` - User account information
- `livestock` - Livestock data
- `training-programs` - Training program information
- `articles` - Article/blog content
- `questionnaires` - Questionnaire templates
- `questionnaire-responses` - User responses to questionnaires

Each collection is automatically created when data is first inserted.
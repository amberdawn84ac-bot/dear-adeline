# MCP Server Setup for Claude Desktop

This guide will help you set up the Dear Adeline MCP server so that Claude Desktop can interact with your learning platform.

## Prerequisites

1. Claude Desktop installed on your computer
2. Dear Adeline application running locally (or deployed)
3. Node.js 18+ installed

## Step 1: Configure Environment Variables

Make sure you have a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Start the Dear Adeline Application

In one terminal, start the Next.js development server:

```bash
npm run dev
```

This will start the application on `http://localhost:3000`.

## Step 3: Configure Claude Desktop

You need to add the MCP server configuration to Claude Desktop's config file.

### Location of Claude Desktop Config File:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Add the MCP Server Configuration:

Open the config file and add the following configuration to the `mcpServers` section:

```json
{
  "mcpServers": {
    "dear-adeline": {
      "command": "node",
      "args": [
        "C:\\home\\claude\\dear-adeline\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\home\\claude\\dear-adeline\\mcp-server.ts"
      ],
      "env": {
        "NEXT_PUBLIC_APP_URL": "http://localhost:3000",
        "NEXT_PUBLIC_SUPABASE_URL": "your_supabase_url",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your_supabase_anon_key"
      }
    }
  }
}
```

**Important Notes:**
- Replace the paths with your actual project path
- For macOS/Linux, use forward slashes: `/Users/yourname/dear-adeline/...`
- Replace the environment variables with your actual Supabase credentials
- If you're using a deployed version, update `NEXT_PUBLIC_APP_URL` to your production URL

### Alternative: Using npm run mcp (Recommended)

You can also configure Claude Desktop to use the npm script:

```json
{
  "mcpServers": {
    "dear-adeline": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "C:\\home\\claude\\dear-adeline",
      "env": {
        "NEXT_PUBLIC_APP_URL": "http://localhost:3000",
        "NEXT_PUBLIC_SUPABASE_URL": "your_supabase_url",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your_supabase_anon_key"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

After updating the configuration file, restart Claude Desktop completely (quit and reopen).

## Step 5: Verify the Connection

1. Open Claude Desktop
2. Start a new conversation
3. Look for the MCP server indicator (usually a tools icon or similar)
4. You should see "dear-adeline" listed as an available MCP server

## Available Tools

Once connected, Claude Desktop will have access to these tools:

### 1. `generate_personalized_lesson`
Generate a personalized lesson based on student interests and grade level.

**Parameters:**
- `topic` (required): The lesson topic
- `gradeLevel` (required): Student's grade level
- `interests` (optional): Student interests for personalization

### 2. `chat_with_adeline`
Send a message to Adeline, the AI learning companion.

**Parameters:**
- `message` (required): The message to send
- `userId` (optional): User ID for personalized responses

### 3. `get_student_interests`
Retrieve saved interests for a student.

**Parameters:**
- `userId` (required): The student's user ID

### 4. `save_student_interests`
Save or update student interests.

**Parameters:**
- `userId` (required): The student's user ID
- `interests` (required): Array of interest strings

### 5. `list_library_projects`
Get available projects from the library.

**Parameters:**
- `category` (optional): Filter by "art", "farm", "science", or "all"

## Testing the MCP Server

You can test the MCP server manually before connecting it to Claude Desktop:

```bash
# Run the MCP server
npm run mcp

# It should output: "Dear Adeline MCP Server running on stdio"
```

The server communicates via stdio (standard input/output), so you won't see a web interface.

## Troubleshooting

### Server Not Appearing in Claude Desktop
1. Check that the config file path is correct
2. Verify the JSON syntax is valid (use a JSON validator)
3. Make sure all file paths in the config are absolute and correct
4. Restart Claude Desktop completely

### API Calls Failing
1. Ensure the Next.js dev server is running (`npm run dev`)
2. Verify environment variables are set correctly
3. Check that the `NEXT_PUBLIC_APP_URL` matches where your app is running
4. Look at the terminal where you ran `npm run dev` for error messages

### Authentication Issues
Some API endpoints may require authentication. You may need to:
1. Add authentication headers to the MCP server
2. Use a service role key for server-side operations
3. Modify the API endpoints to accept MCP requests

## Security Notes

- Never commit your `.env.local` file or expose your Supabase keys
- The MCP server runs locally and only you have access to it
- When using in production, ensure proper authentication and rate limiting

## Next Steps

- Customize the MCP server tools in `mcp-server.ts` to add more functionality
- Add authentication if needed for secure API access
- Explore the [MCP documentation](https://modelcontextprotocol.io/) for advanced features

---

For questions or issues, refer to the main [README.md](./README.md) or the MCP documentation.

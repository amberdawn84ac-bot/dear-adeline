#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration - update these with your actual values
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Helper function to make API calls
async function callAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return await response.json();
}

// Create the MCP server
const server = new Server(
  {
    name: 'dear-adeline',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_personalized_lesson',
        description: 'Generate a personalized lesson for a student based on their interests and learning level. Requires topic, grade level, and optional student interests.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The topic or subject for the lesson',
            },
            gradeLevel: {
              type: 'string',
              description: 'Student grade level (e.g., "5th grade", "high school")',
            },
            interests: {
              type: 'string',
              description: 'Optional: Student interests to personalize the lesson',
            },
          },
          required: ['topic', 'gradeLevel'],
        },
      },
      {
        name: 'chat_with_adeline',
        description: 'Send a message to Adeline, the AI learning companion, and get a response. Use this for educational questions, learning support, or conversation.',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to send to Adeline',
            },
            userId: {
              type: 'string',
              description: 'Optional: User ID for personalized responses',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'get_student_interests',
        description: 'Retrieve saved interests for a student to help personalize learning content',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The student user ID',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'save_student_interests',
        description: 'Save or update interests for a student profile',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The student user ID',
            },
            interests: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of student interests',
            },
          },
          required: ['userId', 'interests'],
        },
      },
      {
        name: 'list_library_projects',
        description: 'Get a list of available projects from the Art, Farm, and Science library',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['art', 'farm', 'science', 'all'],
              description: 'Filter by project category',
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('Missing arguments');
  }

  try {
    switch (name) {
      case 'generate_personalized_lesson': {
        const result = await callAPI('/api/adeline/generate-lesson', {
          method: 'POST',
          body: JSON.stringify({
            topic: args.topic,
            gradeLevel: args.gradeLevel,
            interests: args.interests,
          }),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'chat_with_adeline': {
        const result = await callAPI('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: args.message }],
            userId: args.userId,
          }),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_student_interests': {
        const result = await callAPI(`/api/student-interests/get?userId=${args.userId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'save_student_interests': {
        const result = await callAPI('/api/student-interests/save', {
          method: 'POST',
          body: JSON.stringify({
            userId: args.userId,
            interests: args.interests,
          }),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_library_projects': {
        const category = args.category || 'all';
        const endpoint = category === 'all'
          ? '/api/library/projects'
          : `/api/library/projects?category=${category}`;
        const result = await callAPI(endpoint);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dear Adeline MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

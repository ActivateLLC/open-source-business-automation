import { NextRequest, NextResponse } from 'next/server';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

// Define the schema for the automation request
const AutomationRequestSchema = z.object({
  template: z.string(),
  config: z.object({
    verbose: z.number().min(0).max(2).optional().default(1),
  }).optional(),
});

// Template execution function type
interface TemplateExecutor {
  name: string;
  execute: (stagehand: Stagehand) => Promise<{ success: boolean; data?: unknown; screenshot?: string }>;
}

// Template definitions
const templates: Record<string, TemplateExecutor> = {
  'lead-enrichment': {
    name: 'Lead Enrichment',
    execute: async () => {
      // Example: Navigate to a company website and extract information
      // Note: This is a demo implementation. In production, configure with actual URLs
      // await stagehand.page.goto('https://example.com');
      
      // const data = await stagehand.page.extract({
      //   instruction: 'Extract company name, industry, and employee count',
      //   schema: z.object({
      //     company: z.string(),
      //     industry: z.string().optional(),
      //     employees: z.string().optional(),
      //   }),
      // });
      
      return { 
        success: true, 
        data: { 
          message: 'Lead enrichment template ready',
          note: 'Configure target URLs and data fields in production' 
        } 
      };
    },
  },
  'invoice-download': {
    name: 'Invoice Download',
    execute: async () => {
      // This would be customized for specific vendor portals
      return {
        success: true,
        data: {
          message: 'Invoice download automation requires vendor-specific configuration',
          note: 'Please configure your vendor portal details in settings',
        },
      };
    },
  },
  'competitor-monitoring': {
    name: 'Competitor Monitoring',
    execute: async () => {
      // Example: Monitor a competitor's pricing page
      // Note: This is a demo implementation. In production, configure with actual URLs
      // await stagehand.page.goto('https://example.com/pricing');
      
      // const pricing = await stagehand.page.extract({
      //   instruction: 'Extract all pricing tiers and their features',
      //   schema: z.object({
      //     tiers: z.array(z.object({
      //       name: z.string(),
      //       price: z.string(),
      //       features: z.array(z.string()),
      //     })),
      //   }),
      // });
      
      // Take a screenshot
      // const screenshot = await stagehand.page.screenshot({ fullPage: true });
      
      return {
        success: true,
        data: {
          message: 'Competitor monitoring template ready',
          note: 'Configure competitor URLs and extraction rules in production'
        },
      };
    },
  },
  'form-filling': {
    name: 'Form Auto-Fill',
    execute: async () => {
      // This would be customized for specific forms
      return {
        success: true,
        data: {
          message: 'Form auto-fill automation requires form-specific configuration',
          note: 'Please configure your form details and credentials in settings',
        },
      };
    },
  },
  'data-extraction': {
    name: 'Data Extraction',
    execute: async () => {
      // Example: Extract data from a table
      // Note: This is a demo implementation. In production, configure with actual URLs
      // await stagehand.page.goto('https://example.com/data');
      
      // const tableData = await stagehand.page.extract({
      //   instruction: 'Extract all rows from the data table',
      //   schema: z.object({
      //     rows: z.array(z.object({
      //       columns: z.array(z.string()),
      //     })),
      //   }),
      // });
      
      return { 
        success: true, 
        data: {
          message: 'Data extraction template ready',
          note: 'Configure target URLs and data extraction rules in production'
        }
      };
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, config } = AutomationRequestSchema.parse(body);

    // Check if template exists
    const templateDef = templates[template];
    if (!templateDef) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Initialize Stagehand with configuration
    const stagehand = new Stagehand({
      env: 'LOCAL' as const,
      verbose: (config?.verbose ?? 1) as 0 | 1 | 2,
    });

    try {
      // Initialize the browser
      await stagehand.init();

      // Execute the template
      const result = await templateDef.execute(stagehand);

      // Close the browser
      await stagehand.close();

      return NextResponse.json(result);
    } catch (error) {
      // Make sure to close the browser even if there's an error
      try {
        await stagehand.close();
      } catch (closeError) {
        console.error('Error closing Stagehand:', closeError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Automation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Browser Automation API',
    templates: Object.keys(templates).map((key) => ({
      id: key,
      name: templates[key].name,
    })),
  });
}

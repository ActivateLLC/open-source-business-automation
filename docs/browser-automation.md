# Browser Automation with Stagehand

## Overview

The Open Source Business Automation Stack now includes powerful browser automation capabilities powered by [Stagehand by BrowserBase](https://stagehand.dev). This integration allows users to automate repetitive browser tasks directly from the dashboard, eliminating the need to perform manual duties outside the platform.

## What is Stagehand?

Stagehand is an AI web browsing framework focused on simplicity and extensibility. It provides:

- **AI-Powered Navigation**: Intelligently navigate websites and extract data
- **Natural Language Instructions**: Define automation tasks using simple descriptions
- **Schema-Based Extraction**: Use Zod schemas to extract structured data
- **Browser Control**: Full control over browser interactions (clicks, typing, screenshots)
- **Reliability**: Built-in retry logic and error handling

## Features

### 🤖 Pre-Built Automation Templates

Access ready-to-use automation templates for common business tasks:

1. **Lead Enrichment**
   - Automatically gather additional information about leads
   - Extract profile data from LinkedIn or company websites
   - Enrich CRM data with up-to-date information

2. **Invoice Download**
   - Automatically download invoices from vendor portals
   - Login to multiple vendor systems
   - Batch download and organize invoices

3. **Competitor Monitoring**
   - Monitor competitor websites for pricing changes
   - Track new feature releases
   - Capture screenshots for historical records
   - Extract competitive intelligence data

4. **Form Auto-Fill**
   - Automatically fill out repetitive forms
   - Submit data to multiple sites
   - Reduce manual data entry time

5. **Data Extraction**
   - Extract structured data from websites
   - Scrape tables, lists, and other data elements
   - Export data for analysis or import into other systems

### 📊 Automation Dashboard

The browser automation interface provides:

- **Templates Tab**: Browse and run pre-built automation templates
- **Custom Tab**: Build custom automation workflows (coming soon)
- **History Tab**: View past automation runs and their results
- **Real-time Status**: Track automation progress in real-time
- **Error Handling**: Clear error messages when automations fail

### 🔒 Security & Privacy

- **Local Execution**: Automations run in your local environment
- **No Data Sharing**: Your data stays on your infrastructure
- **Secure Credentials**: Credentials are never logged or transmitted
- **Audit Trail**: Complete logging of all automation activities

## Getting Started

### Accessing Browser Automation

1. Navigate to the Generative UI dashboard at `http://localhost:4000`
2. Click the **🤖 Automation** button in the top navigation
3. You'll be taken to the Browser Automation page

### Running Your First Automation

1. From the **Templates** tab, select an automation template
2. Review the automation steps in the card
3. Click the **Run Automation** button
4. Switch to the **History** tab to monitor progress
5. View results when the automation completes

### Understanding Automation Status

Automations can have the following statuses:

- **Pending**: Automation is queued and waiting to start
- **Running**: Automation is currently executing
- **Completed**: Automation finished successfully
- **Failed**: Automation encountered an error

## API Integration

### Endpoint

```
POST /api/automation/run
```

### Request Format

```json
{
  "template": "lead-enrichment",
  "config": {
    "verbose": 1
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "company": "Example Corp",
    "industry": "Technology",
    "employees": "500-1000"
  }
}
```

### Available Templates

- `lead-enrichment`
- `invoice-download`
- `competitor-monitoring`
- `form-filling`
- `data-extraction`

### Configuration Options

- `verbose`: Log level (0 = errors only, 1 = info, 2 = debug)

## Customization

### Creating Custom Automations

While the visual builder is coming soon, you can create custom automation templates by:

1. Editing `/generative-ui/src/app/api/automation/run/route.ts`
2. Adding a new template to the `templates` object
3. Defining the automation steps using Stagehand's API
4. Rebuilding the application

### Example Custom Template

```typescript
'my-custom-automation': {
  name: 'My Custom Automation',
  execute: async () => {
    // Initialize Stagehand
    const stagehand = new Stagehand({
      env: 'LOCAL',
      verbose: 1,
    });
    
    await stagehand.init();
    
    // Navigate to a website
    await stagehand.page.goto('https://example.com');
    
    // Extract data
    const data = await stagehand.page.extract({
      instruction: 'Extract the main heading',
      schema: z.object({
        heading: z.string(),
      }),
    });
    
    await stagehand.close();
    
    return { success: true, data };
  },
}
```

## Best Practices

### 1. Start with Templates

Begin with pre-built templates and customize them for your needs rather than building from scratch.

### 2. Test in Development

Always test automations in a development environment before running them in production.

### 3. Handle Errors Gracefully

Automations can fail due to website changes, network issues, or other factors. Always review failed automations and adjust accordingly.

### 4. Respect Website Terms

Ensure your automations comply with website terms of service and robots.txt directives.

### 5. Rate Limiting

Be mindful of the frequency of automation runs to avoid overwhelming target websites.

### 6. Monitor Performance

Check the History tab regularly to identify and fix failing automations.

## Troubleshooting

### Automation Fails Immediately

**Cause**: Configuration error or missing dependencies

**Solution**: Check the error message in the History tab and verify your configuration

### Automation Times Out

**Cause**: Website is slow to respond or selector not found

**Solution**: Increase timeout values or update selectors in the template

### Data Extraction Returns Empty Results

**Cause**: Website structure changed or selector is incorrect

**Solution**: Inspect the target website and update extraction instructions

### Browser Not Starting

**Cause**: Missing browser dependencies or permissions

**Solution**: Ensure Playwright browsers are installed:
```bash
cd generative-ui
npx playwright install chromium
```

## Integration with Existing Workflows

Browser automation can be integrated with existing n8n workflows:

1. **Trigger Automations from Workflows**: Call the automation API from n8n nodes
2. **Process Extracted Data**: Feed automation results into lead processing or content workflows
3. **Schedule Automations**: Use n8n's scheduling to run automations at specific times
4. **Chain Automations**: Create complex workflows by chaining multiple automation templates

## Future Enhancements

Planned features for browser automation:

- **Visual Workflow Builder**: Drag-and-drop interface for creating custom automations
- **Scheduled Automations**: Run automations on a schedule
- **Webhook Triggers**: Trigger automations from external events
- **Multi-Page Workflows**: Automate complex workflows across multiple pages
- **Team Collaboration**: Share automation templates with team members
- **Advanced Selectors**: Support for XPath and other advanced selector types
- **Cloud Execution**: Option to run automations in BrowserBase cloud
- **Integration with MCP Servers**: Direct integration with existing MCP tools

## Support & Resources

- **Stagehand Documentation**: https://stagehand.dev
- **BrowserBase**: https://browserbase.com
- **Issue Tracking**: GitHub Issues in this repository
- **Community Support**: Discussions tab on GitHub

## Technical Details

### Dependencies

- `@browserbasehq/stagehand`: ^3.0.5
- `zod`: Latest version for schema validation
- `playwright`: ^1.52.0 (included with Stagehand)

### Architecture

The automation system consists of:

1. **Frontend Component** (`BrowserAutomation.tsx`): React component for the UI
2. **API Route** (`/api/automation/run`): Next.js API route for executing automations
3. **Type Definitions** (`automation.ts`): TypeScript types for type safety
4. **Templates**: Pre-configured automation workflows

### Performance Considerations

- Automations run server-side to avoid browser limitations
- Browser instances are properly cleaned up after each run
- Caching is enabled for improved performance
- Verbose logging can be adjusted based on needs

## License

The browser automation feature is part of the Open Source Business Automation Stack and is released under the MIT License. Stagehand is also MIT licensed.

---

For questions or support, please open an issue on GitHub or refer to the main project documentation.

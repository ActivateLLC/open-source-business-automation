# Content Generation & Distribution Workflow

This workflow provides an end-to-end solution for content planning, creation, publishing, and distribution using free and open-source tools.

## Overview

The Content Generation & Distribution Workflow:

1. Automatically generates content ideas from multiple sources
2. Creates structured content plans with recommendations
3. Drafts content using customizable templates
4. Manages the content approval and publishing process
5. Schedules social media distribution
6. Tracks content performance

![Content Workflow](../images/content-workflow.png)

## Features

- **Automated Idea Generation**: Gathers ideas from industry news, Google Trends, and custom topics
- **Content Planning**: Creates structured content plans with platform and timing recommendations
- **Draft Generation**: Creates content drafts using customizable templates
- **Publishing Workflow**: Manages the approval and publishing process
- **Social Media Distribution**: Automatically schedules content sharing across platforms
- **File-based Storage**: Stores all content in markdown files, no external CMS required

## Setup Guide

### 1. Import the Workflow

1. In n8n, go to Workflows > Import From File
2. Select the `n8n-content-automation.json` file
3. Save the workflow

### 2. Configure Webhook Endpoints

The "Webhook Configuration" node contains URLs that will be called when specific events occur:

1. Edit the "Webhook Configuration" node
2. Update the `social_media_webhook_url` value to your desired endpoint
3. This could be a Slack webhook URL, Buffer API endpoint, or other social media management system

### 3. Customize the Content Template

The content template file is used to generate content drafts:

1. Edit the `/data/content_template.md` file
2. Modify the template structure and placeholders as needed
3. The workflow will use this template when generating draft content

### 4. Activate the Cron Triggers

The workflow contains several time-based triggers:

1. **Weekly Content Planning**: Runs once a week to generate content ideas
2. **Social Media Scheduler**: Runs daily to schedule social media posts
3. Review and adjust the schedule as needed for your content cadence

## Directory Structure

The workflow stores data in these locations:

- `/data/content_ideas.json`: Database of content ideas
- `/data/content_plans/`: Directory for weekly content plans
- `/data/content_drafts/`: Directory for generated content drafts
- `/data/published_content/`: Directory for approved and published content
- `/data/publish_errors/`: Directory for publishing error logs

## Content Workflow Process

1. **Idea Generation**:
   - The Weekly Content Planning node triggers every Monday
   - The workflow fetches trending topics and industry news
   - Ideas are scored and selected based on relevance
   - A content plan is generated with platform recommendations

2. **Content Creation**:
   - Draft content is generated using the template
   - Each draft includes metadata, introduction, main points, and conclusion
   - Drafts are saved as markdown files

3. **Publishing Process**:
   - Content is reviewed and approved via a webhook endpoint
   - Approved content is published to configured platforms
   - Publication status is tracked

4. **Distribution**:
   - The Social Media Scheduler runs daily
   - Content is selected based on the day of the week
   - Custom messages are generated for each platform
   - Distribution requests are sent to the webhook endpoint

## Integration Options

This workflow can be integrated with:

- WordPress (via the WordPress API)
- Social media management tools like Buffer or Hootsuite
- Email marketing platforms
- Custom websites and blogs via webhooks

## Customization Options

- Adjust content idea sources in the "Get Industry News" and "Get Google Trends" nodes
- Modify the content template structure
- Change the scoring and selection algorithm in the "Generate Content Ideas" node
- Customize social media message templates in the "Schedule Social Sharing" node
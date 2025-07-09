// lib/export/pdf-generator.ts - PDF generation for stories
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatDate, formatUserName } from '@utils/formatters';

interface StoryPDFData {
  title: string;
  content: string;
  authorName: string;
  authorAge: number;
  wordCount: number;
  createdAt: Date;
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  };
  storyElements: {
    genre: string;
    setting: string;
    character: string;
    mood: string;
    conflict: string;
    theme: string;
  };
}

export class PDFGenerator {
  /**
   * Generate PDF for a story
   */
  async generateStoryPDF(storyData: StoryPDFData): Promise<Uint8Array> {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed fonts
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      // Add first page
      let page = pdfDoc.addPage([612, 792]); // Letter size
      let currentY = 750;
      const marginX = 50;
      const pageWidth = 612 - marginX * 2;

      // Add header with logo area (placeholder)
      this.addHeader(page, titleFont, bodyFont, currentY, marginX);
      currentY -= 80;

      // Add story title
      const titleSize = 24;
      page.drawText(storyData.title, {
        x: marginX,
        y: currentY,
        size: titleSize,
        font: titleFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= 40;

      // Add author info
      const authorInfo = `By ${storyData.authorName} (Age ${storyData.authorAge})`;
      page.drawText(authorInfo, {
        x: marginX,
        y: currentY,
        size: 14,
        font: bodyFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 15;

      // Add date and word count
      const metaInfo = `Created: ${formatDate(storyData.createdAt)} • ${storyData.wordCount} words`;
      page.drawText(metaInfo, {
        x: marginX,
        y: currentY,
        size: 10,
        font: bodyFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      currentY -= 40;

      // Add story elements section
      currentY = this.addStoryElements(
        page,
        storyData.storyElements,
        bodyFont,
        italicFont,
        currentY,
        marginX,
        pageWidth
      );
      currentY -= 30;

      // Add story content
      const contentLines = this.wrapText(
        storyData.content,
        bodyFont,
        12,
        pageWidth
      );

      page.drawText('Story:', {
        x: marginX,
        y: currentY,
        size: 16,
        font: titleFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= 25;

      // Draw story content with line wrapping and page breaks
      for (const line of contentLines) {
        if (currentY < 100) {
          // Add new page if we're running out of space
          page = pdfDoc.addPage([612, 792]);
          currentY = 750;
          this.addHeader(page, titleFont, bodyFont, currentY, marginX);
          currentY -= 80;
        }

        page.drawText(line, {
          x: marginX,
          y: currentY,
          size: 12,
          font: bodyFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentY -= 18;
      }

      // Add assessment section if available
      if (storyData.assessment) {
        currentY -= 20;
        currentY = this.addAssessmentSection(
          page,
          pdfDoc,
          storyData.assessment,
          titleFont,
          bodyFont,
          currentY,
          marginX,
          pageWidth
        );
      }

      // Add footer to all pages
      this.addFooter(pdfDoc, bodyFont);

      // Serialize the PDF
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generate portfolio PDF with multiple stories
   */
  async generatePortfolioPDF(
    stories: StoryPDFData[],
    userName: string
  ): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.create();
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add cover page
      this.addCoverPage(pdfDoc, titleFont, bodyFont, userName, stories.length);

      // Add table of contents
      this.addTableOfContents(pdfDoc, titleFont, bodyFont, stories);

      // Add each story
      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];

        // Add story separator page
        const page = pdfDoc.addPage([612, 792]);
        const marginX = 50;
        let currentY = 400;

        page.drawText(`Story ${i + 1}`, {
          x: marginX,
          y: currentY,
          size: 32,
          font: titleFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentY -= 50;

        page.drawText(story.title, {
          x: marginX,
          y: currentY,
          size: 24,
          font: titleFont,
          color: rgb(0.3, 0.3, 0.3),
        });

        // Generate story content on new pages
        const storyPDF = await this.generateStoryPDF(story);
        const storyDoc = await PDFDocument.load(storyPDF);
        const storyPages = await pdfDoc.copyPages(
          storyDoc,
          storyDoc.getPageIndices()
        );

        storyPages.forEach(page => pdfDoc.addPage(page));
      }

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error generating portfolio PDF:', error);
      throw new Error('Failed to generate portfolio PDF');
    }
  }

  private addHeader(
    page: any,
    titleFont: any,
    bodyFont: any,
    y: number,
    marginX: number
  ): void {
    // Add MINTOONS header
    page.drawText('MINTOONS', {
      x: marginX,
      y: y,
      size: 20,
      font: titleFont,
      color: rgb(0.54, 0.36, 0.96), // Purple color
    });

    page.drawText('AI-Powered Story Writing for Children', {
      x: marginX,
      y: y - 20,
      size: 10,
      font: bodyFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add horizontal line
    page.drawLine({
      start: { x: marginX, y: y - 35 },
      end: { x: 612 - marginX, y: y - 35 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  }

  private addStoryElements(
    page: any,
    elements: any,
    bodyFont: any,
    italicFont: any,
    startY: number,
    marginX: number,
    pageWidth: number
  ): number {
    let currentY = startY;

    page.drawText('Story Elements:', {
      x: marginX,
      y: currentY,
      size: 14,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 20;

    const elementsList = [
      `Genre: ${elements.genre}`,
      `Setting: ${elements.setting}`,
      `Character: ${elements.character}`,
      `Mood: ${elements.mood}`,
      `Conflict: ${elements.conflict}`,
      `Theme: ${elements.theme}`,
    ];

    // Display elements in two columns
    const columnWidth = pageWidth / 2;
    for (let i = 0; i < elementsList.length; i++) {
      const x = marginX + (i % 2 === 0 ? 0 : columnWidth);
      const y = currentY - Math.floor(i / 2) * 15;

      page.drawText(elementsList[i], {
        x,
        y,
        size: 11,
        font: italicFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    return currentY - Math.ceil(elementsList.length / 2) * 15;
  }

  private addAssessmentSection(
    page: any,
    pdfDoc: any,
    assessment: any,
    titleFont: any,
    bodyFont: any,
    startY: number,
    marginX: number,
    pageWidth: number
  ): number {
    let currentY = startY;

    // Check if we need a new page
    if (currentY < 200) {
      page = pdfDoc.addPage([612, 792]);
      currentY = 750;
      this.addHeader(page, titleFont, bodyFont, currentY, marginX);
      currentY -= 80;
    }

    page.drawText('Assessment:', {
      x: marginX,
      y: currentY,
      size: 16,
      font: titleFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 25;

    // Add scores
    const scores = [
      `Grammar: ${assessment.grammarScore}/100`,
      `Creativity: ${assessment.creativityScore}/100`,
      `Overall: ${assessment.overallScore}/100`,
    ];

    scores.forEach(score => {
      page.drawText(score, {
        x: marginX,
        y: currentY,
        size: 12,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 18;
    });

    currentY -= 10;

    // Add feedback
    page.drawText('Feedback:', {
      x: marginX,
      y: currentY,
      size: 14,
      font: titleFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 20;

    const feedbackLines = this.wrapText(
      assessment.feedback,
      bodyFont,
      11,
      pageWidth
    );
    for (const line of feedbackLines) {
      page.drawText(line, {
        x: marginX,
        y: currentY,
        size: 11,
        font: bodyFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 16;
    }

    return currentY;
  }

  private addCoverPage(
    pdfDoc: any,
    titleFont: any,
    bodyFont: any,
    userName: string,
    storyCount: number
  ): void {
    const page = pdfDoc.addPage([612, 792]);
    const centerX = 306;

    // Add title
    page.drawText('Story Portfolio', {
      x: centerX - 100,
      y: 500,
      size: 32,
      font: titleFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Add author name
    page.drawText(`By ${userName}`, {
      x: centerX - 50,
      y: 450,
      size: 20,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Add story count
    page.drawText(`${storyCount} Amazing Stories`, {
      x: centerX - 70,
      y: 400,
      size: 16,
      font: bodyFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add date
    page.drawText(`Created: ${formatDate(new Date())}`, {
      x: centerX - 60,
      y: 200,
      size: 12,
      font: bodyFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Add MINTOONS branding
    page.drawText('Powered by MINTOONS', {
      x: centerX - 80,
      y: 100,
      size: 14,
      font: titleFont,
      color: rgb(0.54, 0.36, 0.96),
    });
  }

  private addTableOfContents(
    pdfDoc: any,
    titleFont: any,
    bodyFont: any,
    stories: StoryPDFData[]
  ): void {
    const page = pdfDoc.addPage([612, 792]);
    const marginX = 50;
    let currentY = 700;

    page.drawText('Table of Contents', {
      x: marginX,
      y: currentY,
      size: 24,
      font: titleFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 40;

    stories.forEach((story, index) => {
      page.drawText(`${index + 1}. ${story.title}`, {
        x: marginX,
        y: currentY,
        size: 14,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(`${story.wordCount} words`, {
        x: 450,
        y: currentY,
        size: 12,
        font: bodyFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      currentY -= 25;
    });
  }

  private addFooter(pdfDoc: any, bodyFont: any): void {
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      // Add page number
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: 520,
        y: 30,
        size: 10,
        font: bodyFont,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Add footer text
      page.drawText('Generated by MINTOONS - mintoons.com', {
        x: 50,
        y: 30,
        size: 10,
        font: bodyFont,
        color: rgb(0.6, 0.6, 0.6),
      });
    });
  }

  private wrapText(
    text: string,
    font: any,
    size: number,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, force break
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGenerator();

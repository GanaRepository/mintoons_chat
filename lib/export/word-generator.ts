// lib/export/word-generator.ts - Word document generation for stories
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell } from 'docx';
import { formatDate } from '@utils/formatters';

interface StoryWordData {
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
    strengths?: string[];
    suggestions?: string[];
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

export class WordGenerator {
  
  /**
   * Generate Word document for a story
   */
  async generateStoryDocument(storyData: StoryWordData): Promise<Buffer> {
    try {
      // Create sections for the document
      const headerSection = this.createHeaderSection();
      const titleSection = this.createTitleSection(storyData);
      const elementsSection = this.createElementsSection(storyData.storyElements);
      const contentSection = this.createContentSection(storyData.content);
      const assessmentSection = storyData.assessment 
        ? this.createAssessmentSection(storyData.assessment) 
        : [];
      const footerSection = this.createFooterSection(storyData);
      
      // Create document with all sections
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              ...headerSection,
              ...titleSection,
              ...elementsSection,
              ...contentSection,
              ...assessmentSection,
              ...footerSection
            ]
          }
        ]
      });
      
      // Generate and return document as buffer
      return await Packer.toBuffer(doc);
      
    } catch (error) {
      console.error('Error generating Word document:', error);
      throw new Error('Failed to generate Word document');
    }
  }

  /**
   * Generate portfolio Word document with multiple stories
   */
  async generatePortfolioDocument(stories: StoryWordData[], userName: string): Promise<Buffer> {
    try {
      // Create cover page and table of contents
      const coverPage = this.createCoverPage(userName, stories.length);
      const tableOfContents = this.createTableOfContents(stories);
      
      // Create document with all stories
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              ...coverPage,
              ...tableOfContents,
            ]
          },
          ...stories.map((story, index) => ({
            properties: {
              page: {
                pageNumbers: {
                  start: index + 3, // Cover + TOC + stories
                  formatType: 'decimal',
                }
              }
            },
            children: [
              ...this.createStoryDivider(story, index + 1),
              ...this.createTitleSection(story),
              ...this.createElementsSection(story.storyElements),
              ...this.createContentSection(story.content),
              story.assessment ? ...this.createAssessmentSection(story.assessment) : [],
              ...this.createFooterSection(story),
            ]
          }))
        ]
      });
      
      // Generate and return document as buffer
      return await Packer.toBuffer(doc);
      
    } catch (error) {
      console.error('Error generating portfolio Word document:', error);
      throw new Error('Failed to generate portfolio Word document');
    }
  }

  private createHeaderSection(): Paragraph[] {
    return [
      new Paragraph({
        text: "MINTOONS",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.LEFT,
        spacing: {
          after: 100
        },
        style: {
          run: {
            color: "8B5CF6"  // Purple color
          }
        }
      }),
      new Paragraph({
        text: "AI-Powered Story Writing for Children",
        alignment: AlignmentType.LEFT,
        spacing: {
          after: 400
        }
      }),
      new Paragraph({
        text: "",
        border: {
          bottom: {
            color: "E5E7EB", // Light gray
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        spacing: {
          after: 400
        }
      })
    ];
  }

  private createTitleSection(storyData: StoryWordData): Paragraph[] {
    return [
      new Paragraph({
        text: storyData.title,
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 200
        }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `By ${storyData.authorName} (Age ${storyData.authorAge})`,
            size: 24 // 12pt
          })
        ],
        spacing: {
          after: 100
        }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Created: ${formatDate(storyData.createdAt)} • ${storyData.wordCount} words`,
            size: 20, // 10pt
            color: "666666" // Gray
          })
        ],
        spacing: {
          after: 400
        }
      })
    ];
  }

  private createElementsSection(elements: StoryWordData['storyElements']): Paragraph[] {
    // Create table for elements
    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "Story Elements", heading: HeadingLevel.HEADING_2 })],
              columnSpan: 2
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: `Genre: ${elements.genre}` })]
            }),
            new TableCell({
              children: [new Paragraph({ text: `Setting: ${elements.setting}` })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: `Character: ${elements.character}` })]
            }),
            new TableCell({
              children: [new Paragraph({ text: `Mood: ${elements.mood}` })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: `Conflict: ${elements.conflict}` })]
            }),
            new TableCell({
              children: [new Paragraph({ text: `Theme: ${elements.theme}` })]
            })
          ]
        })
      ],
      width: {
        size: 100,
        type: 'pct'
      },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' }
      },
    });

    return [
      new Paragraph({ children: [table] }),
      new Paragraph({ text: "", spacing: { after: 400 } })
    ];
  }

  private createContentSection(content: string): Paragraph[] {
    return [
      new Paragraph({
        text: "Story:",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          after: 200
        }
      }),
      new Paragraph({
        text: content,
        spacing: {
          after: 400,
          line: 360 // 1.5 line spacing
        }
      })
    ];
  }

  private createAssessmentSection(assessment: StoryWordData['assessment']): Paragraph[] {
    if (!assessment) return [];

    const sections: Paragraph[] = [
      new Paragraph({
        text: "Assessment:",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          after: 200
        }
      }),
      new Paragraph({
        text: `Grammar: ${assessment.grammarScore}/100`,
        spacing: {
          after: 100
        }
      }),
      new Paragraph({
        text: `Creativity: ${assessment.creativityScore}/100`,
        spacing: {
          after: 100
        }
      }),
      new Paragraph({
        text: `Overall: ${assessment.overallScore}/100`,
        spacing: {
          after: 200
        }
      }),
      new Paragraph({
        text: "Feedback:",
        heading: HeadingLevel.HEADING_3,
        spacing: {
          after: 100
        }
      }),
      new Paragraph({
        text: assessment.feedback,
        spacing: {
          after: 200
        }
      })
    ];

    // Add strengths if available
    if (assessment.strengths && assessment.strengths.length > 0) {
      sections.push(
        new Paragraph({
          text: "Strengths:",
          heading: HeadingLevel.HEADING_3,
          spacing: {
            after: 100
          }
        })
      );

      assessment.strengths.forEach(strength => {
        sections.push(
          new Paragraph({
            text: `• ${strength}`,
            spacing: {
              after: 100
            }
          })
        );
      });
    }

    // Add suggestions if available
    if (assessment.suggestions && assessment.suggestions.length > 0) {
      sections.push(
        new Paragraph({
          text: "Suggestions for Improvement:",
          heading: HeadingLevel.HEADING_3,
          spacing: {
            after: 100
          }
        })
      );

      assessment.suggestions.forEach(suggestion => {
        sections.push(
          new Paragraph({
            text: `• ${suggestion}`,
            spacing: {
              after: 100
            }
          })
        );
      });
    }

    return sections;
  }

  private createFooterSection(storyData: StoryWordData): Paragraph[] {
    return [
      new Paragraph({
        text: "",
        border: {
          top: {
            color: "E5E7EB", // Light gray
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        spacing: {
          before: 400,
          after: 200
        }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Generated by MINTOONS - mintoons.com",
            size: 18, // 9pt
            color: "999999" // Light gray
          })
        ],
        alignment: AlignmentType.CENTER
      })
    ];
  }

  private createCoverPage(userName: string, storyCount: number): Paragraph[] {
    return [
      new Paragraph({
        text: "Story Portfolio",
        heading: HeadingLevel.TITLE,
        spacing: {
          after: 400,
          before: 1400 // Position vertically centered
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `By ${userName}`,
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 400
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `${storyCount} Amazing Stories`,
        spacing: {
          after: 800
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `Created: ${formatDate(new Date())}`,
        spacing: {
          after: 800
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: "Powered by MINTOONS",
        spacing: {
          after: 400
        },
        alignment: AlignmentType.CENTER,
        style: {
          run: {
            color: "8B5CF6" // Purple color
          }
        }
      }),
      new Paragraph({
        text: "AI-Powered Story Writing for Children",
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400
        }
      }),
      new Paragraph({
        pageBreakBefore: true // Force page break
      })
    ];
  }

  private createTableOfContents(stories: StoryWordData[]): Paragraph[] {
    const sections: Paragraph[] = [
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 400
        }
      })
    ];

    stories.forEach((story, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${story.title}`, bold: true }),
            new TextRun({ text: `  ${story.wordCount} words`, color: "666666" })
          ],
          spacing: {
            after: 200
          }
        })
      );
    });

    sections.push(
      new Paragraph({
        pageBreakBefore: true // Force page break
      })
    );

    return sections;
  }

  private createStoryDivider(story: StoryWordData, index: number): Paragraph[] {
    return [
      new Paragraph({
        text: `Story ${index}`,
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 200,
          before: 1400 // Position vertically centered
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: story.title,
        heading: HeadingLevel.HEADING_2,
        spacing: {
          after: 800
        },
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        pageBreakBefore: true // Force page break
      })
    ];
  }
}

// Export singleton instance
export const wordGenerator = new WordGenerator();
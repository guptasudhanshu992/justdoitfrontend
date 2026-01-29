import { useEffect, useRef, useCallback, forwardRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";
import LinkTool from "@editorjs/link";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import { Box, useColorModeValue } from "@chakra-ui/react";

// API base URL for media uploads
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/api";

/**
 * Editor.js wrapper component for rich content editing
 * 
 * @param {Object} props
 * @param {Object} props.data - Initial Editor.js data (blocks)
 * @param {Function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.readOnly - Whether editor is read-only
 * @param {string} props.holderId - Unique ID for the editor holder
 */
export default forwardRef(function BlockEditor({
  data = null,
  onChange,
  placeholder = "Start writing your content...",
  readOnly = false,
  holderId = "editorjs",
}, ref) {
  const editorRef = useRef(null);
  const holderRef = useRef(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.900", "gray.50");

  // Image upload handler for Editor.js
  const uploadImageByFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/media/upload/image`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Image upload failed:", error);
      return {
        success: 0,
        message: "Upload failed",
      };
    }
  };

  // Image upload by URL handler
  const uploadImageByUrl = async (url) => {
    try {
      const response = await fetch(`${API_BASE_URL}/media/upload/url?url=${encodeURIComponent(url)}`, {
        method: "POST",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Image fetch failed:", error);
      return {
        success: 0,
        message: "Failed to fetch image from URL",
      };
    }
  };

  // Editor.js tools configuration
  const getTools = useCallback(() => ({
    header: {
      class: Header,
      inlineToolbar: true,
      config: {
        placeholder: "Enter a heading",
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 2,
      },
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      config: {
        placeholderText: placeholder,
      },
    },
    list: {
      class: List,
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
      },
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: "Enter a quote",
        captionPlaceholder: "Quote author",
      },
    },
    code: {
      class: Code,
      config: {
        placeholder: "Enter code here...",
      },
    },
    inlineCode: {
      class: InlineCode,
    },
    marker: {
      class: Marker,
    },
    underline: {
      class: Underline,
    },
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
    warning: {
      class: Warning,
      inlineToolbar: true,
      config: {
        titlePlaceholder: "Title",
        messagePlaceholder: "Message",
      },
    },
    linkTool: {
      class: LinkTool,
      config: {
        endpoint: `${API_BASE_URL}/media/link-preview`,
      },
    },
    embed: {
      class: Embed,
      config: {
        services: {
          youtube: true,
          vimeo: true,
          twitter: true,
          instagram: true,
          codepen: true,
          github: true,
        },
      },
    },
    image: {
      class: ImageTool,
      config: {
        uploader: {
          uploadByFile: uploadImageByFile,
          uploadByUrl: uploadImageByUrl,
        },
        captionPlaceholder: "Image caption",
        buttonContent: "Select an image",
        types: "image/*",
      },
    },
  }), [placeholder]);

  // Initialize Editor.js only once on mount
  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    const initEditor = async () => {
      try {
        const editor = new EditorJS({
          holder: holderId,
          tools: getTools(),
          data: data || {
            time: Date.now(),
            blocks: [],
            version: "2.29.0",
          },
          placeholder: placeholder,
          readOnly: readOnly,
          onReady: () => {
            console.log("Editor.js is ready!");
          },
        });

        editorRef.current = editor;
      } catch (error) {
        console.error("Error initializing Editor.js:", error);
      }
    };

    initEditor();

    // Cleanup on unmount
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [holderId, getTools, placeholder, readOnly]);

  // Method to get editor data (can be called by parent via ref)
  // Filters out empty paragraphs to keep data clean
  const getData = useCallback(async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        
        // Filter out empty paragraphs while keeping other block types
        if (outputData.blocks) {
          outputData.blocks = outputData.blocks.filter(block => {
            if (block.type === 'paragraph') {
              // Keep only non-empty paragraphs
              return block.data?.text?.trim().length > 0;
            }
            // Keep all other block types (images, headers, etc.)
            return true;
          });
        }
        
        return outputData;
      } catch (error) {
        console.error("Error getting editor data:", error);
        return null;
      }
    }
    return null;
  }, []);

  // Expose getData method
  useEffect(() => {
    if (holderRef.current) {
      holderRef.current.getData = getData;
    }
    
    // Also expose via ref if using forwardRef
    if (ref) {
      if (typeof ref === 'function') {
        ref({ getData, editor: editorRef.current });
      } else {
        ref.current = { getData, editor: editorRef.current };
      }
    }
  }, [getData, ref]);

  return (
    <Box
      ref={holderRef}
      id={holderId}
      bg={bgColor}
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor={borderColor}
      borderRadius="0"
      minH="300px"
      p={4}
      color={textColor}
      sx={{
        // Editor.js styling overrides
        ".ce-block__content": {
          maxWidth: "100%",
        },
        ".ce-toolbar__content": {
          maxWidth: "100%",
        },
        ".cdx-block": {
          maxWidth: "100%",
        },
        ".ce-paragraph": {
          lineHeight: "1.8",
        },
        ".ce-header": {
          fontWeight: "700",
        },
        ".cdx-quote": {
          borderLeftColor: "blue.500",
        },
        ".cdx-quote__text": {
          fontStyle: "italic",
        },
        ".ce-code__textarea": {
          bg: useColorModeValue("gray.100", "gray.700"),
          color: textColor,
          borderRadius: "md",
        },
        ".cdx-warning": {
          bg: useColorModeValue("yellow.50", "yellow.900"),
          borderColor: "yellow.500",
        },
        ".image-tool__image": {
          borderRadius: "md",
        },
        ".image-tool__caption": {
          fontSize: "sm",
          color: useColorModeValue("gray.600", "gray.400"),
        },
        // Table styles
        ".tc-table": {
          borderColor: borderColor,
        },
        ".tc-cell": {
          borderColor: borderColor,
        },
      }}
    />
  );
});

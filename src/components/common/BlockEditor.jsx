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
import SimpleImageTool from "./SimpleImageTool";
import { Box, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { API_BASE_URL } from "../../services/api";
import ImageModal from "./ImageModal";

/**
 * Editor.js wrapper component for rich content editing
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
  const currentImageToolRef = useRef(null);
  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.900", "gray.50");

  // Handle image selection from modal
  const handleImageSelect = (imageData) => {
    if (currentImageToolRef.current) {
      currentImageToolRef.current.setImage(imageData.url, imageData.caption || "");
      currentImageToolRef.current = null;
    }
    onImageModalClose();
    
    // Trigger onChange
    if (onChange && editorRef.current) {
      editorRef.current.save().then(outputData => {
        onChange(outputData);
      }).catch(err => console.error("Save error:", err));
    }
  };

  // Handle modal close
  const handleImageModalClose = () => {
    currentImageToolRef.current = null;
    onImageModalClose();
  };

  // Handler when image tool requests to open modal
  const handleImageToolClick = useCallback((blockIndex, toolInstance) => {
    currentImageToolRef.current = toolInstance;
    onImageModalOpen();
  }, [onImageModalOpen]);

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
        placeholder: placeholder,
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
        captionPlaceholder: "Quote's author",
      },
    },
    code: {
      class: Code,
      config: {
        placeholder: "Enter code",
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
      class: SimpleImageTool,
      config: {
        onSelectImage: handleImageToolClick,
      },
    },
  }), [placeholder, handleImageToolClick]);

  // Initialize Editor.js
  useEffect(() => {
    if (!holderRef.current || editorRef.current) return;

    const initEditor = async () => {
      try {
        // Clean input data - filter out invalid image blocks
        let cleanData = data || {
          time: Date.now(),
          blocks: [],
          version: "2.29.0",
        };
        
        if (cleanData.blocks) {
          cleanData = {
            ...cleanData,
            blocks: cleanData.blocks.filter(block => {
              if (block.type === 'image') {
                const url = block.data?.url;
                return url && (url.startsWith('http://') || url.startsWith('https://'));
              }
              if (block.type === 'paragraph') {
                // Keep paragraphs with content
                return block.data?.text !== undefined;
              }
              return true;
            })
          };
        }
        
        const editor = new EditorJS({
          holder: holderId,
          tools: getTools(),
          data: cleanData,
          placeholder: placeholder,
          readOnly: readOnly,
          onChange: async () => {
            if (onChange && editorRef.current) {
              try {
                const outputData = await editorRef.current.save();
                onChange(outputData);
              } catch (error) {
                console.error("Error in onChange:", error);
              }
            }
          },
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

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [holderId, getTools, placeholder, readOnly, onChange]);

  // Get editor data - filters out empty/invalid blocks
  const getData = useCallback(async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        
        if (outputData.blocks) {
          outputData.blocks = outputData.blocks.filter(block => {
            if (block.type === 'paragraph') {
              return block.data?.text?.trim().length > 0;
            }
            if (block.type === 'image') {
              const url = block.data?.url;
              return url && (url.startsWith('http://') || url.startsWith('https://'));
            }
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
    
    if (ref) {
      if (typeof ref === 'function') {
        ref({ getData, editor: editorRef.current });
      } else {
        ref.current = { getData, editor: editorRef.current };
      }
    }
  }, [getData, ref]);

  return (
    <>
      <Box
        ref={holderRef}
        id={holderId}
        minH="300px"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        color={textColor}
        sx={{
          ".ce-block__content": {
            maxWidth: "100%",
          },
          ".ce-toolbar__content": {
            maxWidth: "100%",
          },
          ".cdx-block": {
            padding: "0.4em 0",
          },
          ".ce-paragraph": {
            lineHeight: "1.6",
          },
          ".ce-header": {
            padding: "0.6em 0 0.3em",
          },
          ".cdx-quote": {
            borderLeft: `3px solid ${borderColor}`,
            paddingLeft: "1em",
            fontStyle: "italic",
          },
          ".cdx-list": {
            paddingLeft: "1.5em",
          },
          ".ce-code__textarea": {
            fontFamily: "monospace",
            fontSize: "14px",
            background: useColorModeValue("gray.50", "gray.900"),
            color: textColor,
            borderRadius: "4px",
          },
          ".tc-table": {
            borderColor: borderColor,
          },
          ".tc-cell": {
            borderColor: borderColor,
          },
        }}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={handleImageModalClose}
        onSelect={handleImageSelect}
        API_BASE_URL={API_BASE_URL}
      />
    </>
  );
});

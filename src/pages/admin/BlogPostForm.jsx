import { useState, useCallback } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  useColorModeValue,
  Box,
  Text,
} from "@chakra-ui/react";
import BlockEditor from "../../components/common/BlockEditor";

export default function BlogPostForm({ post, onSave, onCancel }) {
  // Parse existing content if it's Editor.js format
  const parseInitialContent = (content) => {
    if (!content) return null;
    if (typeof content === "object" && content.blocks) {
      return content;
    }
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed.blocks) return parsed;
      } catch {
        // Legacy plain text - convert to Editor.js format
        return {
          time: Date.now(),
          blocks: [
            {
              type: "paragraph",
              data: { text: content },
            },
          ],
          version: "2.29.0",
        };
      }
    }
    return null;
  };

  const [formData, setFormData] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: parseInitialContent(post?.content),
    status: post?.is_published ? "Published" : "Draft",
  });

  const [editorKey] = useState(() => `editor-${Date.now()}`);

  const textColor = useColorModeValue("gray.900", "gray.50");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = useCallback((data) => {
    setFormData((prev) => ({
      ...prev,
      content: data,
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate content
    const hasContent = formData.content && 
      formData.content.blocks && 
      formData.content.blocks.length > 0;
    
    if (!formData.title.trim()) {
      alert("Title is required!");
      return;
    }
    
    if (!hasContent) {
      alert("Content is required!");
      return;
    }
    
    // Calculate word count and reading time from Editor.js content
    let wordCount = 0;
    if (formData.content?.blocks) {
      formData.content.blocks.forEach((block) => {
        if (block.data?.text) {
          // Strip HTML tags and count words
          const text = block.data.text.replace(/<[^>]*>/g, "");
          wordCount += text.split(/\s+/).filter((word) => word.length > 0).length;
        }
        if (block.data?.items) {
          block.data.items.forEach((item) => {
            const text = item.replace(/<[^>]*>/g, "");
            wordCount += text.split(/\s+/).filter((word) => word.length > 0).length;
          });
        }
      });
    }
    
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    onSave({
      ...formData,
      word_count: wordCount,
      reading_time: readingTime,
      is_published: formData.status === "Published",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Title */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontWeight="600">
            Title
          </FormLabel>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "blue.500" }}
          />
        </FormControl>

        {/* Excerpt */}
        <FormControl>
          <FormLabel color={textColor} fontWeight="600">
            Excerpt
          </FormLabel>
          <Textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Enter post excerpt (optional)"
            rows={2}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "blue.500" }}
          />
        </FormControl>

        {/* Content - Editor.js */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontWeight="600">
            Content
          </FormLabel>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Use the block-based editor to add text, images, code, and more.
          </Text>
          <Box minH="400px">
            <BlockEditor
              key={editorKey}
              holderId={editorKey}
              data={formData.content}
              onChange={handleEditorChange}
              placeholder="Start writing your blog post..."
            />
          </Box>
        </FormControl>

        {/* Status */}
        <FormControl>
          <FormLabel color={textColor} fontWeight="600">
            Status
          </FormLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "blue.500" }}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <HStack spacing={3} justify="flex-end" pt={4}>
          <Button variant="outline" onClick={onCancel} color={textColor}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue">
            {post ? "Update Post" : "Create Post"}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

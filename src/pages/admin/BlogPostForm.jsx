import { useState } from "react";
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
} from "@chakra-ui/react";

export default function BlogPostForm({ post, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    post || {
      title: "",
      excerpt: "",
      content: "",
      status: "Draft",
    }
  );

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required!");
      return;
    }
    onSave(formData);
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

        {/* Content */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontWeight="600">
            Content
          </FormLabel>
          <Textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter post content"
            rows={6}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "blue.500" }}
          />
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

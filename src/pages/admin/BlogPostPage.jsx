import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useColorModeValue,
  useToast,
  Checkbox,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { blogsApi, categoriesApi, tagsApi } from "../../services/api";
import BlockEditor from "../../components/common/BlockEditor";

export default function BlogPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const textColor = useColorModeValue("gray.900", "gray.50");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sidebarBgColor = useColorModeValue("white", "gray.800");

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editorKey] = useState(() => `editor-${Date.now()}`);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const editorRef = useRef(null);

  // Parse Editor.js content
  const parseEditorContent = (content) => {
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
    title: "",
    excerpt: "",
    content: null,
    is_published: false,
    featured: false,
    publish_date: new Date().toISOString().slice(0, 16),
    meta_title: "",
    meta_description: "",
    slug: "",
    focus_keyword: "",
    categories: [],
    tags: [],
  });

  // Fetch categories, tags, and post data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories and tags
        const [categoriesData, tagsData] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          tagsApi.getAll({ limit: 100 }),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);

        // If editing, fetch post data
        if (id) {
          const postData = await blogsApi.getById(id);
          setFormData({
            title: postData.title || "",
            excerpt: postData.excerpt || "",
            content: parseEditorContent(postData.content),
            is_published: postData.is_published || false,
            featured: postData.featured || false,
            publish_date: postData.publish_at 
              ? new Date(postData.publish_at).toISOString().slice(0, 16)
              : new Date().toISOString().slice(0, 16),
            meta_title: postData.meta_title || "",
            meta_description: postData.meta_description || "",
            slug: postData.slug || "",
            focus_keyword: postData.focus_keyword || "",
            categories: postData.categories?.map(c => c.id) || [],
            tags: postData.tags?.map(t => t.id) || [],
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
        toast({
          title: "Error",
          description: err.message || "Failed to load data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Auto-generate slug from title
    if (name === "title") {
      const slugified = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      newFormData.slug = slugified;
    }

    setFormData(newFormData);
  };

  // Handle Editor.js content change - Update word count in real-time
  const handleEditorChange = useCallback((data) => {
    // Calculate word count and reading time for display
    if (data && data.blocks) {
      let count = 0;
      data.blocks.forEach((block) => {
        if (block.data?.text) {
          const text = block.data.text.replace(/<[^>]*>/g, "");
          count += text.split(/\s+/).filter((word) => word.length > 0).length;
        }
        if (block.data?.items) {
          block.data.items.forEach((item) => {
            const text = item.replace(/<[^>]*>/g, "");
            count += text.split(/\s+/).filter((word) => word.length > 0).length;
          });
        }
      });
      setWordCount(count);
      setReadingTime(Math.max(1, Math.ceil(count / 200)));
    }
  }, []);

  // Calculate word count from Editor.js content
  const calculateWordCount = (content) => {
    if (!content || !content.blocks) return 0;
    let wordCount = 0;
    content.blocks.forEach((block) => {
      if (block.data?.text) {
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
    return wordCount;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Get current editor data
    let currentContent = formData.content;
    if (editorRef.current && editorRef.current.getData) {
      try {
        const editorData = await editorRef.current.getData();
        currentContent = editorData;
        // Update formData with current editor content
        setFormData(prev => ({ ...prev, content: editorData }));
      } catch (error) {
        console.error("Error getting editor data:", error);
      }
    }
    
    const hasContent = currentContent && 
      currentContent.blocks && 
      currentContent.blocks.length > 0;
    
    if (!formData.title.trim() || !hasContent) {
      toast({
        title: "Error",
        description: "Title and content are required!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);

      // Calculate word count and reading time from Editor.js content
      const wordCount = calculateWordCount(currentContent);
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: currentContent,
        is_published: formData.is_published,
        featured: formData.featured,
        publish_at: formData.publish_date || new Date().toISOString(),
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        focus_keyword: formData.focus_keyword || null,
        word_count: wordCount,
        reading_time: readingTime,
        categories: formData.categories,
        tags: formData.tags,
      };

      if (id) {
        // Update existing post
        await blogsApi.update(id, payload);
        toast({
          title: "Post updated",
          description: "The post has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new post
        const response = await blogsApi.create(payload);
        toast({
          title: "Post created",
          description: "The post has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Add a small delay to ensure data is ready on the blog posts page
      setTimeout(() => {
        navigate("/admin/blog-posts");
      }, 500);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save post",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/blog-posts");
  };

  // Show loading spinner while fetching data for edit mode
  if (loading && id) {
    return (
      <VStack width="100%" align="center" justify="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
        <Text color={textColor} mt={4}>Loading post data...</Text>
      </VStack>
    );
  }

  // Show error state
  if (error && id) {
    return (
      <VStack width="100%" align="center" justify="center" minH="400px">
        <Text color="red.500" fontSize="lg">{error}</Text>
        <Button colorScheme="blue" onClick={handleCancel} mt={4}>
          Back to Posts
        </Button>
      </VStack>
    );
  }

  return (
    <VStack width="100%" align="stretch" spacing={0}>
      {/* Page Header */}
      <Box
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={8}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="1400px" mx="auto">
          <Heading
            as="h1"
            size="lg"
            fontWeight="700"
            color={textColor}
            letterSpacing="-1px"
          >
            {id ? "Edit Blog Post" : "Create New Blog Post"}
          </Heading>
        </Box>
      </Box>

      {/* Form Content */}
      <Box
        flex={1}
        py={8}
        width="100%"
      >
        <Box width="100%">
          <HStack align="flex-start" spacing={6}>
            {/* Main Content Area */}
            <VStack
              flex={1}
              align="stretch"
              spacing={6}
            >
              <Box
                bg={sidebarBgColor}
                p={6}
                rounded="lg"
              >
                <form onSubmit={handleSave}>
                  {/* Content - Editor.js */}
                  <FormControl mb={6} isRequired>
                    <FormLabel color={textColor} fontWeight="600">
                      Content
                    </FormLabel>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Use the block-based editor to add text, images, code, and more.
                    </Text>
                    <Box minH="400px">
                      <BlockEditor
                        ref={editorRef}
                        key={editorKey}
                        holderId={editorKey}
                        data={formData.content}
                        onChange={handleEditorChange}
                        placeholder="Start writing your blog post..."
                      />
                    </Box>
                    {/* Word Count and Reading Time */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={3}
                      fontSize="sm"
                      color={textColor}
                      opacity={0.6}
                    >
                      <Box>
                        Words: {wordCount}
                      </Box>
                      <Box>
                        Reading Time: {readingTime} min
                      </Box>
                    </Box>
                  </FormControl>

                  {/* Excerpt */}
                  <FormControl mb={6}>
                    <FormLabel color={textColor} fontWeight="600">
                      Excerpt
                    </FormLabel>
                    <Textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Enter post excerpt (optional)"
                      color={textColor}
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500" }}
                      minHeight="100px"
                      resize="none"
                      overflowY="hidden"
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = Math.max(100, e.target.scrollHeight) + "px";
                      }}
                    />
                  </FormControl>

                  {/* Action Buttons */}
                  <HStack spacing={3} justify="flex-start" pt={4}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="md"
                      isLoading={saving}
                      loadingText={id ? "Updating..." : "Creating..."}
                    >
                      {id ? "Update Post" : "Create Post"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      color={textColor}
                      size="md"
                      isDisabled={saving}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </form>
              </Box>
            </VStack>

            {/* Right Sidebar */}
            <Box
              width={{ base: "100%", md: "300px" }}
              display={{ base: "none", md: "block" }}
              bg={sidebarBgColor}
              p={6}
              rounded="lg"
              height="fit-content"
            >
              <VStack align="stretch" spacing={6}>
                {/* Title */}
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="600" fontSize="sm">
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
                    size="sm"
                  />
                </FormControl>

                {/* URL Slug */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                    URL Slug
                  </FormLabel>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="url-slug"
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.500" }}
                    size="sm"
                  />
                </FormControl>

                {/* Categories */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                    Categories
                  </FormLabel>
                  <ChakraSelect
                    name="categories"
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    value={categories
                      .filter((cat) => formData.categories.includes(cat.id))
                      .map((category) => ({
                        value: category.id,
                        label: category.name,
                      }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        categories: selectedOptions.map((opt) => opt.value),
                      }))
                    }
                    isMulti
                    colorScheme="blue"
                    size="sm"
                    isLoading={loading}
                  />
                </FormControl>

                {/* Tags */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                    Tags
                  </FormLabel>
                  <ChakraSelect
                    name="tags"
                    options={tags.map((tag) => ({
                      value: tag.id,
                      label: tag.name,
                    }))}
                    value={tags
                      .filter((tag) => formData.tags.includes(tag.id))
                      .map((tag) => ({
                        value: tag.id,
                        label: tag.name,
                      }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        tags: selectedOptions.map((opt) => opt.value),
                      }))
                    }
                    isMulti
                    colorScheme="blue"
                    size="sm"
                    isLoading={loading}
                  />
                </FormControl>

                {/* Featured */}
                <FormControl display="flex" alignItems="center" gap={2}>
                  <Checkbox
                    name="featured"
                    isChecked={formData.featured}
                    onChange={handleChange}
                  />
                  <FormLabel
                    color={textColor}
                    fontWeight="600"
                    fontSize="sm"
                    mb={0}
                    cursor="pointer"
                  >
                    Featured Post
                  </FormLabel>
                </FormControl>

                {/* Published */}
                <FormControl display="flex" alignItems="center" gap={2}>
                  <Checkbox
                    name="is_published"
                    isChecked={formData.is_published}
                    onChange={handleChange}
                  />
                  <FormLabel
                    color={textColor}
                    fontWeight="600"
                    fontSize="sm"
                    mb={0}
                    cursor="pointer"
                  >
                    Published
                  </FormLabel>
                </FormControl>

                {/* Publish At */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="600" fontSize="sm">
                    Publish DateTime
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleChange}
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.500" }}
                    size="sm"
                  />
                </FormControl>

                {/* SEO Section */}
                <Box borderTop="1px solid" borderColor={borderColor} pt={4}>
                  <Heading as="h3" size="sm" color={textColor} mb={4}>
                    SEO Settings
                  </Heading>

                  {/* Meta Title */}
                  <FormControl mb={3}>
                    <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                      Meta Title
                    </FormLabel>
                    <Input
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      placeholder="SEO title"
                      color={textColor}
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500" }}
                      size="sm"
                      maxLength={60}
                    />
                    <Box fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                      {formData.meta_title.length}/60
                    </Box>
                  </FormControl>

                  {/* Meta Description */}
                  <FormControl mb={3}>
                    <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                      Meta Description
                    </FormLabel>
                    <Textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      placeholder="SEO description"
                      color={textColor}
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500" }}
                      size="sm"
                      rows={3}
                      maxLength={160}
                    />
                    <Box fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                      {formData.meta_description.length}/160
                    </Box>
                  </FormControl>

                  {/* Focus Keyword */}
                  <FormControl>
                    <FormLabel color={textColor} fontWeight="600" fontSize="xs">
                      Focus Keyword
                    </FormLabel>
                    <Input
                      name="focus_keyword"
                      value={formData.focus_keyword}
                      onChange={handleChange}
                      placeholder="Primary keyword"
                      color={textColor}
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500" }}
                      size="sm"
                    />
                  </FormControl>
                </Box>
              </VStack>
            </Box>
          </HStack>
        </Box>
      </Box>
    </VStack>
  );
}

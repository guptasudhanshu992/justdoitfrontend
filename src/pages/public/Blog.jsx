import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
  Badge,
  HStack,
  Spinner,
  Button,
  LinkBox,
  LinkOverlay,
  Select,
  IconButton,
  Wrap,
  WrapItem,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { blogsApi, categoriesApi, tagsApi } from "../../services/api";

export default function Blog() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardHoverBgColor = useColorModeValue("gray.50", "gray.700");
  const filterBgColor = useColorModeValue("white", "gray.800");

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default filter values
  const defaultFilters = {
    viewMode: "grid",
    sortBy: "newest",
    selectedCategory: "",
    selectedTag: "",
    searchQuery: "",
  };

  // Load saved filters from localStorage
  const getSavedFilters = () => {
    try {
      const saved = localStorage.getItem("blogFilters");
      if (saved) {
        return { ...defaultFilters, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error loading saved filters:", e);
    }
    return defaultFilters;
  };

  const savedFilters = getSavedFilters();

  // Filter states with localStorage initialization
  const [viewMode, setViewMode] = useState(savedFilters.viewMode);
  const [sortBy, setSortBy] = useState(savedFilters.sortBy);
  const [selectedCategory, setSelectedCategory] = useState(savedFilters.selectedCategory);
  const [selectedTag, setSelectedTag] = useState(savedFilters.selectedTag);
  const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      viewMode,
      sortBy,
      selectedCategory,
      selectedTag,
      searchQuery,
    };
    try {
      localStorage.setItem("blogFilters", JSON.stringify(filters));
    } catch (e) {
      console.error("Error saving filters:", e);
    }
  }, [viewMode, sortBy, selectedCategory, selectedTag, searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to extract text preview from Editor.js content
  const getContentPreview = (content) => {
    if (!content) return "";
    
    // If it's already a string, use it directly
    if (typeof content === "string") {
      return content.substring(0, 200) + "...";
    }
    
    // If it's an Editor.js object with blocks
    if (content?.blocks && Array.isArray(content.blocks)) {
      let text = "";
      for (const block of content.blocks) {
        if (block.data?.text) {
          text += block.data.text + " ";
        }
        if (block.data?.items && Array.isArray(block.data.items)) {
          text += block.data.items.join(" ") + " ";
        }
        if (text.length >= 200) break;
      }
      return text.substring(0, 200) + "...";
    }
    
    return "";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsData, categoriesData, tagsData] = await Promise.all([
        blogsApi.getAll({ limit: 100, published_only: true }),
        categoriesApi.getAll({ limit: 100 }),
        tagsApi.getAll({ limit: 100 }),
      ]);
      
      // Handle both direct array and wrapped response
      const posts = Array.isArray(postsData) ? postsData : (postsData?.data || postsData?.results || []);
      const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData?.results || []);
      const tags = Array.isArray(tagsData) ? tagsData : (tagsData?.data || tagsData?.results || []);
      
      setPosts(posts);
      setCategories(categories);
      setTags(tags);
    } catch (err) {
      setError(err.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((post) =>
        post.categories?.some((cat) => cat.id === parseInt(selectedCategory))
      );
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((post) =>
        post.tags?.some((tag) => tag.id === parseInt(selectedTag))
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return result;
  }, [posts, searchQuery, selectedCategory, selectedTag, sortBy]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTag("");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTag || sortBy !== "newest";

  return (
    <VStack width="100%" align="stretch" spacing={0}>
      {/* Page Header */}
      <Box
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={12}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="1400px" mx="auto" textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="700"
            color={textColor}
            letterSpacing="-2px"
            mb={3}
          >
            Blog
          </Heading>
          <Text
            fontSize="lg"
            color={subtextColor}
            fontWeight="500"
            letterSpacing="0.3px"
          >
            A log of everything that I know
          </Text>
        </Box>
      </Box>

      {/* Filters Section */}
      <Box
        bg={filterBgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={4}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="1400px" mx="auto">
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            {/* Left: Search and Filters */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              flex={1}
              flexWrap="wrap"
            >
              {/* Search */}
              <InputGroup maxW={{ base: "100%", sm: "250px" }}>
                <InputLeftElement pointerEvents="none" color={subtextColor}>
                  🔍
                </InputLeftElement>
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderColor={borderColor}
                  color={textColor}
                  _placeholder={{ color: subtextColor }}
                />
              </InputGroup>

              {/* Category Filter */}
              <Select
                placeholder="All Categories"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                maxW={{ base: "100%", sm: "180px" }}
                borderColor={borderColor}
                color={textColor}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              {/* Tag Filter */}
              <Select
                placeholder="All Tags"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                maxW={{ base: "100%", sm: "180px" }}
                borderColor={borderColor}
                color={textColor}
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Select>

              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                maxW={{ base: "100%", sm: "150px" }}
                borderColor={borderColor}
                color={textColor}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clearFilters}
                  color={subtextColor}
                  _hover={{ color: textColor }}
                >
                  Clear
                </Button>
              )}
            </Flex>

            {/* Right: View Toggle */}
            <HStack spacing={1}>
              <IconButton
                aria-label="Grid view"
                icon={<Text fontSize="lg">▦</Text>}
                variant={viewMode === "grid" ? "solid" : "ghost"}
                colorScheme={viewMode === "grid" ? "blue" : "gray"}
                size="sm"
                onClick={() => setViewMode("grid")}
              />
              <IconButton
                aria-label="List view"
                icon={<Text fontSize="lg">☰</Text>}
                variant={viewMode === "list" ? "solid" : "ghost"}
                colorScheme={viewMode === "list" ? "blue" : "gray"}
                size="sm"
                onClick={() => setViewMode("list")}
              />
            </HStack>
          </Flex>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <HStack mt={3} spacing={2} flexWrap="wrap">
              <Text fontSize="sm" color={subtextColor}>
                Showing {filteredPosts.length} of {posts.length} posts
              </Text>
            </HStack>
          )}
        </Box>
      </Box>

      {/* Content Area */}
      <Box flex={1} px={{ base: 4, md: 8 }} py={8} width="100%">
        <Box maxW="1400px" mx="auto">
          {/* Loading State */}
          {loading && (
            <VStack py={12}>
              <Spinner size="xl" color="blue.500" />
              <Text color={subtextColor} mt={4}>
                Loading posts...
              </Text>
            </VStack>
          )}

          {/* Error State */}
          {error && !loading && (
            <VStack py={12}>
              <Text color="red.500" fontSize="lg">
                {error}
              </Text>
              <Button colorScheme="blue" onClick={fetchData} mt={4}>
                Try Again
              </Button>
            </VStack>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPosts.length === 0 && (
            <Box textAlign="center" py={12} color={subtextColor}>
              {posts.length === 0
                ? "No blog posts yet. Check back soon!"
                : "No posts match your filters. Try adjusting your search."}
            </Box>
          )}

          {/* Grid View */}
          {!loading && !error && filteredPosts.length > 0 && viewMode === "grid" && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredPosts.map((post) => (
                <LinkBox
                  key={post.id}
                  as="article"
                  bg={cardBgColor}
                  borderRadius="lg"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    shadow: "lg",
                    bg: cardHoverBgColor,
                  }}
                >
                  {/* Placeholder Image */}
                  <Box
                    h="180px"
                    bg={useColorModeValue("gray.200", "gray.700")}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize="4xl"
                      color={useColorModeValue("gray.400", "gray.500")}
                    >
                      📝
                    </Text>
                  </Box>

                  {/* Card Content */}
                  <Box p={5}>
                    {/* Categories & Tags */}
                    <HStack spacing={2} mb={3} flexWrap="wrap">
                      {post.featured && (
                        <Badge colorScheme="yellow" fontSize="xs">
                          Featured
                        </Badge>
                      )}
                      {post.categories?.slice(0, 2).map((cat) => (
                        <Badge key={cat.id} colorScheme="blue" fontSize="xs">
                          {cat.name}
                        </Badge>
                      ))}
                    </HStack>

                    {/* Title */}
                    <Heading as="h3" size="md" mb={2} color={textColor}>
                      <LinkOverlay as={RouterLink} to={`/blog/${post.slug}`}>
                        {post.title}
                      </LinkOverlay>
                    </Heading>

                    {/* Excerpt */}
                    <Text
                      color={subtextColor}
                      fontSize="sm"
                      noOfLines={3}
                      mb={4}
                    >
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </Text>

                    {/* Meta Info */}
                    <HStack
                      spacing={4}
                      fontSize="xs"
                      color={subtextColor}
                      borderTop="1px solid"
                      borderColor={borderColor}
                      pt={3}
                    >
                      <Text>{formatDate(post.created_at)}</Text>
                      {post.reading_time > 0 && (
                        <Text>{post.reading_time} min read</Text>
                      )}
                    </HStack>
                  </Box>
                </LinkBox>
              ))}
            </SimpleGrid>
          )}

          {/* List View */}
          {!loading && !error && filteredPosts.length > 0 && viewMode === "list" && (
            <VStack spacing={4} align="stretch">
              {filteredPosts.map((post) => (
                <LinkBox
                  key={post.id}
                  as="article"
                  bg={cardBgColor}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  p={5}
                  transition="all 0.2s"
                  _hover={{
                    shadow: "md",
                    bg: cardHoverBgColor,
                  }}
                >
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                    align={{ base: "stretch", md: "center" }}
                  >
                    {/* Content */}
                    <Box flex={1}>
                      {/* Categories & Tags */}
                      <HStack spacing={2} mb={2} flexWrap="wrap">
                        {post.featured && (
                          <Badge colorScheme="yellow" fontSize="xs">
                            Featured
                          </Badge>
                        )}
                        {post.categories?.slice(0, 3).map((cat) => (
                          <Badge key={cat.id} colorScheme="blue" fontSize="xs">
                            {cat.name}
                          </Badge>
                        ))}
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} colorScheme="gray" fontSize="xs">
                            #{tag.name}
                          </Badge>
                        ))}
                      </HStack>

                      {/* Title */}
                      <Heading as="h3" size="md" mb={2} color={textColor}>
                        <LinkOverlay as={RouterLink} to={`/blog/${post.slug}`}>
                          {post.title}
                        </LinkOverlay>
                      </Heading>

                      {/* Excerpt */}
                      <Text
                        color={subtextColor}
                        fontSize="sm"
                        noOfLines={2}
                      >
                        {post.excerpt || getContentPreview(post.content)}
                      </Text>
                    </Box>

                    {/* Meta Info */}
                    <VStack
                      align={{ base: "flex-start", md: "flex-end" }}
                      spacing={1}
                      minW={{ md: "150px" }}
                    >
                      <Text fontSize="sm" color={subtextColor}>
                        {formatDate(post.created_at)}
                      </Text>
                      {post.reading_time > 0 && (
                        <Text fontSize="xs" color={subtextColor}>
                          {post.reading_time} min read
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                </LinkBox>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    </VStack>
  );
}

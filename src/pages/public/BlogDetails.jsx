import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Spinner,
  Button,
  Badge,
  Divider,
  Container,
  Icon,
} from "@chakra-ui/react";
import { blogsApi } from "../../services/api";
import BlockRenderer from "../../components/common/BlockRenderer";

export default function BlogDetails() {
  const { slug } = useParams();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.900", "gray.50");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsApi.getBySlug(slug);
      setPost(data);
    } catch (err) {
      setError(err.message || "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <VStack width="100%" align="center" justify="center" minH="60vh">
        <Spinner size="xl" color="blue.500" />
        <Text color={subtextColor} mt={4}>
          Loading post...
        </Text>
      </VStack>
    );
  }

  // Error State
  if (error) {
    return (
      <VStack width="100%" align="center" justify="center" minH="60vh" px={4}>
        <Heading size="lg" color="red.500" mb={4}>
          Post Not Found
        </Heading>
        <Text color={subtextColor} mb={6} textAlign="center">
          {error}
        </Text>
        <Button as={RouterLink} to="/blog" colorScheme="blue">
          ← Back to Blog
        </Button>
      </VStack>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <VStack width="100%" align="stretch" spacing={0}>
      {/* Hero Header */}
      <Box
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={{ base: 8, md: 16 }}
        px={{ base: 4, md: 8 }}
      >
        <Container maxW="800px">
          {/* Back Link */}
          <Button
            as={RouterLink}
            to="/blog"
            variant="ghost"
            size="sm"
            mb={6}
            color={subtextColor}
            _hover={{ color: textColor }}
          >
            ← Back to Blog
          </Button>

          {/* Categories & Tags */}
          <HStack spacing={2} mb={4} flexWrap="wrap">
            {post.featured && (
              <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
                Featured
              </Badge>
            )}
            {post.categories?.map((cat) => (
              <Badge key={cat.id} colorScheme="blue" fontSize="sm" px={3} py={1}>
                {cat.name}
              </Badge>
            ))}
            {post.tags?.map((tag) => (
              <Badge key={tag.id} colorScheme="gray" fontSize="sm" px={3} py={1}>
                #{tag.name}
              </Badge>
            ))}
          </HStack>

          {/* Title */}
          <Heading
            as="h1"
            size="2xl"
            fontWeight="800"
            color={textColor}
            letterSpacing="-1px"
            lineHeight="1.2"
            mb={6}
          >
            {post.title}
          </Heading>

          {/* Meta Info */}
          <HStack
            spacing={4}
            color={subtextColor}
            fontSize="sm"
            flexWrap="wrap"
          >
            <Text>{formatDate(post.created_at)}</Text>
            {post.reading_time > 0 && (
              <>
                <Text>•</Text>
                <Text>{post.reading_time} min read</Text>
              </>
            )}
            {post.word_count > 0 && (
              <>
                <Text>•</Text>
                <Text>{post.word_count.toLocaleString()} words</Text>
              </>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Content Area */}
      <Box flex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Container maxW="800px">
          <Box>
            {/* Blog Content - Using BlockRenderer for Editor.js content */}
            <Box
              className="blog-content"
              color={textColor}
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="1.8"
            >
              <BlockRenderer content={post.content} />
            </Box>
          </Box>

          {/* Bottom Navigation */}
          <Divider my={8} borderColor={borderColor} />

          <HStack justify="space-between">
            <Button
              as={RouterLink}
              to="/blog"
              variant="outline"
              colorScheme="blue"
            >
              ← Back to Blog
            </Button>
          </HStack>
        </Container>
      </Box>
    </VStack>
  );
}

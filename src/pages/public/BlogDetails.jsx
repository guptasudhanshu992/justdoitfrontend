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
            {/* Blog Content */}
            <Box
              className="blog-content"
              color={textColor}
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="1.8"
              sx={{
                "& p": {
                  mb: 6,
                },
                "& h2": {
                  fontSize: "2xl",
                  fontWeight: "700",
                  mt: 8,
                  mb: 4,
                },
                "& h3": {
                  fontSize: "xl",
                  fontWeight: "600",
                  mt: 6,
                  mb: 3,
                },
                "& ul, & ol": {
                  pl: 6,
                  mb: 6,
                },
                "& li": {
                  mb: 2,
                },
                "& blockquote": {
                  borderLeft: "4px solid",
                  borderColor: "blue.500",
                  pl: 4,
                  py: 2,
                  my: 6,
                  fontStyle: "italic",
                  color: subtextColor,
                },
                "& pre": {
                  bg: useColorModeValue("gray.100", "gray.700"),
                  p: 4,
                  borderRadius: "md",
                  overflowX: "auto",
                  mb: 6,
                },
                "& code": {
                  bg: useColorModeValue("gray.100", "gray.700"),
                  px: 2,
                  py: 1,
                  borderRadius: "sm",
                  fontSize: "sm",
                },
                "& a": {
                  color: "blue.500",
                  textDecoration: "underline",
                },
                "& img": {
                  maxW: "100%",
                  borderRadius: "md",
                  my: 6,
                },
              }}
            >
              {/* Render content - for now just as text, later can use markdown parser */}
              {post.content.split("\n\n").map((paragraph, index) => (
                <Text key={index} mb={6}>
                  {paragraph}
                </Text>
              ))}
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

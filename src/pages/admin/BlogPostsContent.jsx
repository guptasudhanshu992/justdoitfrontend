import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { blogsApi } from "../../services/api";

export default function BlogPostsContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const textColor = useColorModeValue("gray.900", "gray.50");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");
  const publishedBg = useColorModeValue("green.100", "green.900");
  const publishedColor = useColorModeValue("green.800", "green.100");
  const draftBg = useColorModeValue("yellow.100", "yellow.900");
  const draftColor = useColorModeValue("yellow.800", "yellow.100");
  const toast = useToast();
  const cancelRef = useRef();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Fetch posts whenever component mounts or location changes (i.e., when navigating back to this page)
  useEffect(() => {
    fetchPosts();
  }, [location]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsApi.getAll({ limit: 100 });
      // Handle both direct array and wrapped response
      const postsData = Array.isArray(data) ? data : (data?.data || data?.results || []);
      setPosts(postsData);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch posts",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    navigate("/admin/blog-posts/new");
  };

  const handleEditPost = (post) => {
    navigate(`/admin/blog-posts/${post.id}/edit`);
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setDeleting(true);
      await blogsApi.delete(postToDelete.id);
      setPosts(posts.filter((p) => p.id !== postToDelete.id));
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete post",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
      setPostToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={12}>
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="red.500" mb={4}>{error}</Text>
        <Button colorScheme="blue" onClick={fetchPosts}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box mb={6}>
        <HStack justify="space-between" align="center" mb={6}>
          <Heading as="h2" size="lg" color={textColor}>
            Blog Posts
          </Heading>
          <Button colorScheme="blue" size="sm" onClick={handleCreatePost}>
            + New Post
          </Button>
        </HStack>

        {/* Posts Table */}
        <Box
          overflowX="auto"
          border="1px solid"
          borderColor={borderColor}
          rounded="md"
        >
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color={textColor} fontWeight="600">
                  Title
                </Th>
                <Th color={textColor} fontWeight="600">
                  Status
                </Th>
                <Th color={textColor} fontWeight="600">
                  Created
                </Th>
                <Th color={textColor} fontWeight="600">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {posts.map((post) => (
                <Tr
                  key={post.id}
                  _hover={{ bg: hoverBgColor }}
                  cursor="pointer"
                >
                  <Td color={textColor} fontWeight="500">
                    {post.title}
                  </Td>
                  <Td color={textColor}>
                    <Box
                      display="inline-block"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="600"
                      bg={post.is_published ? publishedBg : draftBg}
                      color={post.is_published ? publishedColor : draftColor}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </Box>
                  </Td>
                  <Td color={textColor}>{formatDate(post.created_at)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditPost(post)}
                      >
                        ✎ Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeletePost(post)}
                      >
                        🗑 Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {posts.length === 0 && (
          <Box textAlign="center" py={12} color={textColor} opacity={0.6}>
            No posts found. Create your first post!
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textColor}>
              Delete Post
            </AlertDialogHeader>
            <AlertDialogBody color={textColor}>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={deleting}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
                ml={3}
                isLoading={deleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

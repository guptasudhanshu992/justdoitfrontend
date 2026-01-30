import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  VStack,
} from "@chakra-ui/react";
import { tagsApi } from "../../services/api";

export default function TagsContent() {
  const navigate = useNavigate();
  const textColor = useColorModeValue("gray.900", "gray.50");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();
  const cancelRef = useRef();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagsApi.getAll({ limit: 100 });
      // Handle both direct array and wrapped response
      const tagsData = Array.isArray(data) ? data : (data?.data || data?.results || []);
      setTags(tagsData);
    } catch (err) {
      setError(err.message || "Failed to fetch tags");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch tags",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = () => {
    navigate("/admin/tags/new");
  };

  const handleEditTag = (tag) => {
    navigate(`/admin/tags/${tag.id}/edit`);
  };

  const handleDeleteTag = (tag) => {
    setTagToDelete(tag);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await tagsApi.delete(tagToDelete.id);
      setTags(tags.filter((t) => t.id !== tagToDelete.id));
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete tag",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <VStack align="center" justify="center" minH="200px">
        <Spinner size="xl" color="blue.500" />
        <Text color={textColor} mt={4}>Loading tags...</Text>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <VStack align="center" justify="center" minH="200px">
        <Text color="red.500" fontSize="lg">{error}</Text>
        <Button colorScheme="blue" onClick={fetchTags} mt={4}>
          Retry
        </Button>
      </VStack>
    );
  }

  return (
    <>
      <Box mb={6}>
        <HStack justify="space-between" align="center" mb={6}>
          <Heading as="h2" size="lg" color={textColor}>
            Tags
          </Heading>
          <Button colorScheme="blue" size="sm" onClick={handleCreateTag}>
            + New Tag
          </Button>
        </HStack>

        {/* Tags Table */}
        <Box
          overflowX="auto"
          border="1px solid"
          borderColor={borderColor}
          rounded="md"
        >
          <Table variant="simple">
            <Thead bg={useColorModeValue("gray.50", "gray.800")}>
              <Tr>
                <Th color={textColor} fontWeight="600">
                  Name
                </Th>
                <Th color={textColor} fontWeight="600">
                  Slug
                </Th>
                <Th color={textColor} fontWeight="600">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {tags.map((tag) => (
                <Tr
                  key={tag.id}
                  _hover={{ bg: hoverBgColor }}
                  cursor="pointer"
                >
                  <Td color={textColor} fontWeight="500">
                    {tag.name}
                  </Td>
                  <Td color={textColor}>{tag.slug}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditTag(tag)}
                      >
                        ✎ Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteTag(tag)}
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

        {tags.length === 0 && (
          <Box textAlign="center" py={12} color={textColor} opacity={0.6}>
            No tags found. Create your first tag!
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
              Delete Tag
            </AlertDialogHeader>
            <AlertDialogBody color={textColor}>
              Are you sure you want to delete "{tagToDelete?.name}"? This action cannot be undone.
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

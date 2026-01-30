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
import { categoriesApi } from "../../services/api";

export default function CategoriesContent() {
  const navigate = useNavigate();
  const textColor = useColorModeValue("gray.900", "gray.50");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();
  const cancelRef = useRef();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesApi.getAll({ limit: 100 });
      // Handle both direct array and wrapped response
      const categoriesData = Array.isArray(data) ? data : (data?.data || data?.results || []);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch categories",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    navigate("/admin/categories/new");
  };

  const handleEditCategory = (category) => {
    navigate(`/admin/categories/${category.id}/edit`);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await categoriesApi.delete(categoryToDelete.id);
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete category",
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
        <Text color={textColor} mt={4}>Loading categories...</Text>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <VStack align="center" justify="center" minH="200px">
        <Text color="red.500" fontSize="lg">{error}</Text>
        <Button colorScheme="blue" onClick={fetchCategories} mt={4}>
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
            Categories
          </Heading>
          <Button colorScheme="blue" size="sm" onClick={handleCreateCategory}>
            + New Category
          </Button>
        </HStack>

        {/* Categories Table */}
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
              {categories.map((category) => (
                <Tr
                  key={category.id}
                  _hover={{ bg: hoverBgColor }}
                  cursor="pointer"
                >
                  <Td color={textColor} fontWeight="500">
                    {category.name}
                  </Td>
                  <Td color={textColor}>{category.slug}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditCategory(category)}
                      >
                        ✎ Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category)}
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

        {categories.length === 0 && (
          <Box textAlign="center" py={12} color={textColor} opacity={0.6}>
            No categories found. Create your first category!
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
              Delete Category
            </AlertDialogHeader>
            <AlertDialogBody color={textColor}>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
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

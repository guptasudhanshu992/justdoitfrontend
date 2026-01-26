import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
  useToast,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { categoriesApi } from "../../services/api";

export default function CategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const textColor = useColorModeValue("gray.900", "gray.50");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const boxBgColor = useColorModeValue("white", "gray.800");

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // Fetch category data when editing
  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await categoriesApi.getById(id);
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
          });
        } catch (err) {
          setError(err.message || "Failed to load category");
          toast({
            title: "Error",
            description: err.message || "Failed to load category",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Auto-generate slug from name
    if (name === "name") {
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Name and slug are required!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      };

      if (id) {
        await categoriesApi.update(id, payload);
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await categoriesApi.create(payload);
        toast({
          title: "Category created",
          description: "The category has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      navigate("/admin/categories");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save category",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/categories");
  };

  // Loading state
  if (loading) {
    return (
      <VStack align="center" justify="center" minH="200px">
        <Spinner size="xl" color="blue.500" />
        <Text color={textColor} mt={4}>Loading category...</Text>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <VStack align="center" justify="center" minH="200px">
        <Text color="red.500" fontSize="lg">{error}</Text>
        <Button colorScheme="blue" onClick={handleCancel} mt={4}>
          Back to Categories
        </Button>
      </VStack>
    );
  }

  return (
    <>
      {/* Page Header */}
      <Box mb={8}>
        <Heading
          as="h1"
          size="lg"
          fontWeight="700"
          color={textColor}
          letterSpacing="-1px"
        >
          {id ? "Edit Category" : "Create New Category"}
        </Heading>
      </Box>

      {/* Form Content */}
      <Box flex={1} py={8} width="100%">
        <Box width="100%" maxW="500px">
          <Box bg={boxBgColor} p={6} rounded="lg">
            <form onSubmit={handleSave}>
              {/* Name */}
              <FormControl mb={6} isRequired>
                <FormLabel color={textColor} fontWeight="600">
                  Category Name
                </FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: "blue.500" }}
                  size="lg"
                />
              </FormControl>

              {/* Slug */}
              <FormControl mb={6} isRequired>
                <FormLabel color={textColor} fontWeight="600">
                  Slug
                </FormLabel>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="category-slug"
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: "blue.500" }}
                  size="lg"
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
                  {id ? "Update Category" : "Create Category"}
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
        </Box>
      </Box>
    </>
  );
}

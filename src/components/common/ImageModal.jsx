/**
 * Enhanced Image Selection Modal for Editor.js
 * Allows users to: upload new images, select existing images, or add from URL
 */

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Input,
  Box,
  Text,
  Grid,
  GridItem,
  Image as ChakraImage,
  Spinner,
  useToast,
  useColorModeValue,
  FormControl,
  FormLabel,
  Progress,
} from "@chakra-ui/react";
import { mediaApi } from "../../services/api";

export const ImageModal = ({ isOpen, onClose, onSelect, API_BASE_URL }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageCaption, setImageCaption] = useState("");
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // Fetch images when tab 1 is selected
  useEffect(() => {
    if (isOpen && selectedTab === 1) {
      fetchExistingImages();
    }
  }, [isOpen, selectedTab]);

  const fetchExistingImages = async () => {
    setLoading(true);
    try {
      const data = await mediaApi.getAll();
      const files = data?.files || [];
      // Filter only image files
      const images = files.filter((file) => {
        const ext = file.key.split(".").pop().toLowerCase();
        return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
      });
      setExistingImages(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast({
        title: "Error",
        description: "Failed to load existing images",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploadedFile(file);
  };

  // Upload new image
  const handleUploadImage = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(`${API_BASE_URL}/media/upload/image`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setUploadProgress(100);

      // Select the uploaded image
      onSelect({
        url: result.file.url,
        caption: imageCaption,
      });

      // Reset form
      setUploadedFile(null);
      setImageCaption("");
      setUploadProgress(0);
      onClose();

      toast({
        title: "Success",
        description: "Image uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle URL image selection
  const handleUrlImage = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter an image URL",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Call onSelect with the URL - the preview already shows if the image loads
    onSelect({
      url: imageUrl.trim(),
      caption: imageCaption,
    });

    // Reset form
    setImageUrl("");
    setImageCaption("");
    onClose();

    toast({
      title: "Success",
      description: "Image added successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle existing image selection
  const handleSelectExisting = () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image from the list",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSelect({
      url: selectedImage.url,
      caption: imageCaption,
    });

    // Reset form
    setSelectedImage(null);
    setImageCaption("");
    onClose();

    toast({
      title: "Success",
      description: "Image selected successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" closeOnEsc={true} closeOnOverlayClick={true}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>Insert Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs index={selectedTab} onChange={setSelectedTab} variant="soft-rounded">
            <TabList mb={4}>
              <Tab>Upload New</Tab>
              <Tab>From Library</Tab>
              <Tab>From URL</Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Upload New Image */}
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel color={textColor}>Select Image File</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      cursor="pointer"
                      p={2}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP, SVG
                    </Text>
                  </FormControl>

                  {uploadedFile && (
                    <Box
                      p={3}
                      borderRadius="md"
                      bg={hoverBg}
                      w="full"
                      textAlign="center"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        ✓ Selected: {uploadedFile.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </Text>
                    </Box>
                  )}

                  {uploading && uploadProgress > 0 && (
                    <Box w="full">
                      <Text fontSize="xs" color={textColor} mb={1}>
                        Uploading... {uploadProgress}%
                      </Text>
                      <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                    </Box>
                  )}

                  <FormControl>
                    <FormLabel color={textColor}>Image Caption (Optional)</FormLabel>
                    <Input
                      placeholder="Enter image caption"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      disabled={uploading}
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    isLoading={uploading}
                    onClick={handleUploadImage}
                    w="full"
                    isDisabled={!uploadedFile}
                  >
                    Upload Image
                  </Button>
                </VStack>
              </TabPanel>

              {/* Tab 2: From Library */}
              <TabPanel>
                <VStack spacing={4}>
                  {loading ? (
                    <VStack justify="center" align="center" h="300px">
                      <Spinner size="lg" color="blue.500" />
                      <Text color="gray.500">Loading images...</Text>
                    </VStack>
                  ) : existingImages.length === 0 ? (
                    <VStack justify="center" align="center" h="300px">
                      <Text color="gray.500" textAlign="center">
                        No images in library yet. 
                        <br />
                        Upload an image using the "Upload New" tab.
                      </Text>
                    </VStack>
                  ) : (
                    <>
                      <Grid
                        templateColumns="repeat(auto-fill, minmax(120px, 1fr))"
                        gap={3}
                        w="full"
                      >
                        {existingImages.map((image) => (
                          <GridItem
                            key={image.key}
                            cursor="pointer"
                            onClick={() => setSelectedImage(image)}
                            borderRadius="md"
                            overflow="hidden"
                            border="3px solid"
                            borderColor={
                              selectedImage?.key === image.key
                                ? "blue.500"
                                : borderColor
                            }
                            bg={
                              selectedImage?.key === image.key ? "blue.50" : "transparent"
                            }
                            transition="all 0.2s"
                            _hover={{
                              borderColor: "blue.300",
                              transform: "scale(1.02)",
                            }}
                            position="relative"
                          >
                            <ChakraImage
                              src={image.url}
                              alt={image.key}
                              w="100%"
                              h="120px"
                              objectFit="cover"
                            />
                            {selectedImage?.key === image.key && (
                              <Box
                                position="absolute"
                                top={1}
                                right={1}
                                bg="blue.500"
                                color="white"
                                borderRadius="full"
                                w={6}
                                h={6}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="sm"
                              >
                                ✓
                              </Box>
                            )}
                          </GridItem>
                        ))}
                      </Grid>

                      {selectedImage && (
                        <>
                          <FormControl>
                            <FormLabel color={textColor}>Image Caption (Optional)</FormLabel>
                            <Input
                              placeholder="Enter image caption"
                              value={imageCaption}
                              onChange={(e) => setImageCaption(e.target.value)}
                            />
                          </FormControl>

                          <Button
                            colorScheme="blue"
                            onClick={handleSelectExisting}
                            w="full"
                          >
                            Select Image
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 3: From URL */}
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel color={textColor}>Image URL</FormLabel>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={uploading}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Paste the full URL of the image you want to add
                    </Text>
                  </FormControl>

                  {imageUrl && (
                    <Box
                      maxW="200px"
                      maxH="150px"
                      borderRadius="md"
                      overflow="hidden"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <ChakraImage
                        src={imageUrl}
                        alt="Preview"
                        w="100%"
                        h="150px"
                        objectFit="cover"
                        onError={() => {
                          console.warn("Could not load preview for URL");
                        }}
                      />
                    </Box>
                  )}

                  <FormControl>
                    <FormLabel color={textColor}>Image Caption (Optional)</FormLabel>
                    <Input
                      placeholder="Enter image caption"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      disabled={uploading}
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    isLoading={uploading}
                    onClick={handleUrlImage}
                    w="full"
                    isDisabled={!imageUrl.trim()}
                  >
                    Add Image
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImageModal;

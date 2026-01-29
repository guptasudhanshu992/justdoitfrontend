import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  IconButton,
  Button,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  HStack,
  VStack,
  Badge,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Flex,
} from "@chakra-ui/react";
import { mediaApi } from "../../services/api";

export default function MediaContent() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [nextToken, setNextToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef(null);
  const cancelRef = useRef();
  const toast = useToast();
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Fetch media files
  const fetchMedia = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const params = { limit: 50 };
      if (filter) params.folder = filter;
      if (loadMore && nextToken) params.continuation_token = nextToken;
      
      const response = await mediaApi.getAll(params);
      
      if (response.success) {
        if (loadMore) {
          setMedia(prev => [...prev, ...response.files]);
        } else {
          setMedia(response.files);
        }
        setNextToken(response.nextToken);
      }
    } catch (error) {
      toast({
        title: "Error fetching media",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, nextToken, toast]);

  useEffect(() => {
    fetchMedia();
  }, [filter]);

  // Handle file upload
  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const isVideo = file.type.startsWith("video/");
        
        if (isVideo) {
          await mediaApi.uploadVideo(file);
        } else {
          await mediaApi.uploadImage(file);
        }
        
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show toast
    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
        status: successCount > 0 && errorCount === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${errorCount} file(s)`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    // Refresh media list
    fetchMedia();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!mediaToDelete) return;

    try {
      await mediaApi.delete(mediaToDelete.key);
      
      toast({
        title: "Media deleted",
        description: "File has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Remove from local state
      setMedia(prev => prev.filter(m => m.key !== mediaToDelete.key));
    } catch (error) {
      toast({
        title: "Error deleting media",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMediaToDelete(null);
      onDeleteClose();
    }
  };

  // Open delete confirmation
  const confirmDelete = (mediaItem, e) => {
    e.stopPropagation();
    setMediaToDelete(mediaItem);
    onDeleteOpen();
  };

  // Open preview
  const openPreview = (mediaItem) => {
    setSelectedMedia(mediaItem);
    onPreviewOpen();
  };

  // Copy URL to clipboard
  const copyUrl = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Media URL has been copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg">Media Library</Heading>
        
        <HStack spacing={4}>
          {/* Filter */}
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            width="150px"
            size="sm"
          >
            <option value="">All Files</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
          </Select>

          {/* Upload Button */}
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            loadingText="Uploading..."
          >
            Upload Media
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleUpload}
            display="none"
          />
        </HStack>
      </Flex>

      {/* Loading State */}
      {loading ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColor}>Loading media...</Text>
          </VStack>
        </Center>
      ) : media.length === 0 ? (
        /* Empty State */
        <Center py={20}>
          <VStack spacing={4}>
            <Text fontSize="6xl">📁</Text>
            <Text fontSize="lg" fontWeight="medium">No media files found</Text>
            <Text color={textColor}>Upload some images or videos to get started</Text>
            <Button
              colorScheme="blue"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Your First File
            </Button>
          </VStack>
        </Center>
      ) : (
        /* Media Grid */
        <>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
            {media.map((item) => (
              <Box
                key={item.key}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                onClick={() => openPreview(item)}
              >
                {/* Thumbnail */}
                <Box
                  position="relative"
                  paddingTop="100%"
                  bg={useColorModeValue("gray.100", "gray.700")}
                >
                  {item.type === "video" ? (
                    <Center
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                    >
                      <VStack spacing={1}>
                        <Text fontSize="3xl">🎬</Text>
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.extension.toUpperCase()}
                        </Badge>
                      </VStack>
                    </Center>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.key}
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      fallback={
                        <Center
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                        >
                          <Spinner size="sm" />
                        </Center>
                      }
                    />
                  )}
                  
                  {/* Action Buttons Overlay */}
                  <HStack
                    position="absolute"
                    top="2"
                    right="2"
                    spacing={1}
                    opacity="0"
                    _groupHover={{ opacity: 1 }}
                    sx={{
                      ".chakra-box:hover &": { opacity: 1 },
                    }}
                  >
                    <Tooltip label="Copy URL">
                      <IconButton
                        size="xs"
                        icon={<Text>📋</Text>}
                        onClick={(e) => copyUrl(item.url, e)}
                        bg="white"
                        _hover={{ bg: "gray.100" }}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        size="xs"
                        icon={<Text>🗑️</Text>}
                        onClick={(e) => confirmDelete(item, e)}
                        bg="white"
                        _hover={{ bg: "red.100" }}
                      />
                    </Tooltip>
                  </HStack>
                </Box>

                {/* Info */}
                <Box p={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    noOfLines={1}
                    title={item.key}
                  >
                    {item.key.split("/").pop()}
                  </Text>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color={textColor}>
                      {formatSize(item.size)}
                    </Text>
                    <Badge
                      size="sm"
                      colorScheme={item.type === "video" ? "purple" : "green"}
                      fontSize="10px"
                    >
                      {item.type}
                    </Badge>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>

          {/* Load More Button */}
          {nextToken && (
            <Center mt={8}>
              <Button
                onClick={() => fetchMedia(true)}
                isLoading={loadingMore}
                loadingText="Loading..."
                variant="outline"
              >
                Load More
              </Button>
            </Center>
          )}
        </>
      )}

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMedia?.key.split("/").pop()}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedMedia && (
              <VStack spacing={4} align="stretch">
                {/* Media Preview */}
                <Center
                  bg={useColorModeValue("gray.100", "gray.700")}
                  borderRadius="lg"
                  overflow="hidden"
                  maxH="500px"
                >
                  {selectedMedia.type === "video" ? (
                    <video
                      src={selectedMedia.url}
                      controls
                      style={{ maxHeight: "500px", maxWidth: "100%" }}
                    />
                  ) : (
                    <Image
                      src={selectedMedia.url}
                      alt={selectedMedia.key}
                      maxH="500px"
                      objectFit="contain"
                    />
                  )}
                </Center>

                {/* Details */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Details</Text>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={(e) => copyUrl(selectedMedia.url, e)}
                      >
                        📋 Copy URL
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={(e) => {
                          onPreviewClose();
                          confirmDelete(selectedMedia, e);
                        }}
                      >
                        🗑️ Delete
                      </Button>
                    </HStack>
                  </HStack>
                  
                  <SimpleGrid columns={2} spacing={2} fontSize="sm">
                    <Text color={textColor}>Type:</Text>
                    <Text>{selectedMedia.type} ({selectedMedia.extension})</Text>
                    
                    <Text color={textColor}>Size:</Text>
                    <Text>{formatSize(selectedMedia.size)}</Text>
                    
                    <Text color={textColor}>Uploaded:</Text>
                    <Text>{formatDate(selectedMedia.lastModified)}</Text>
                    
                    <Text color={textColor}>URL:</Text>
                    <Text noOfLines={1} title={selectedMedia.url}>
                      {selectedMedia.url}
                    </Text>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Media
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this file? This action cannot be undone.
              {mediaToDelete && (
                <Text mt={2} fontWeight="medium" fontSize="sm">
                  {mediaToDelete.key}
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

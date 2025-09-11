import { useState, useEffect, useCallback, useRef } from 'react';
import type { Photo, Album } from '../types/index';
import { getPhotos, uploadPhoto, getAlbums, addPhotosToAlbum, removePhotosFromAlbum, getPhotoAlbums } from '../api/client';

const Photos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [photoAlbums, setPhotoAlbums] = useState<{[photoId: number]: Album[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const [filterAlbum, setFilterAlbum] = useState<number | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number} | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchDragPhoto, setTouchDragPhoto] = useState<Photo | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [focusedPhotoIndex, setFocusedPhotoIndex] = useState<number>(-1);
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(false);

  // Load photos and albums on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Initialize Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const photoId = parseInt(entry.target.getAttribute('data-photo-id') || '0');
          if (entry.isIntersecting) {
            // Only trigger loading once per image
            setLoadedImages(prev => {
              if (!prev.has(photoId)) {
                return new Set(prev).add(photoId);
              }
              return prev;
            });
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading earlier to reduce flicker
        threshold: 0.01 // Very small threshold to trigger earlier
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe new photo elements
  const observePhotoElement = useCallback((element: HTMLDivElement | null, photoId: number) => {
    if (!element || !observerRef.current) return;
    
    element.setAttribute('data-photo-id', photoId.toString());
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, []);

  // Helper function to get filtered photos
  const getFilteredPhotos = useCallback(() => {
    return filterAlbum 
      ? photos.filter(photo => photoAlbums[photo.id]?.some(album => album.id === filterAlbum))
      : photos;
  }, [filterAlbum, photos, photoAlbums]);

  // Toggle photo selection
  const togglePhotoSelection = useCallback((photoId: number) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  }, [selectedPhotos]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardNavEnabled) return;

      const currentPhotos = getFilteredPhotos();
      if (currentPhotos.length === 0) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedPhotoIndex(prev => 
            prev < currentPhotos.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedPhotoIndex(prev => 
            prev > 0 ? prev - 1 : currentPhotos.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedPhotoIndex >= 0 && focusedPhotoIndex < currentPhotos.length) {
            const photo = currentPhotos[focusedPhotoIndex];
            if (e.ctrlKey || e.metaKey) {
              togglePhotoSelection(photo.id);
            } else {
              setSelectedPhoto(photo);
            }
          }
          break;
        case ' ':
          e.preventDefault();
          if (focusedPhotoIndex >= 0 && focusedPhotoIndex < currentPhotos.length) {
            const photo = currentPhotos[focusedPhotoIndex];
            // Space always toggles selection (no Ctrl needed)
            togglePhotoSelection(photo.id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (selectedPhotos.size > 0) {
            // First Esc: clear selection
            setSelectedPhotos(new Set());
          } else {
            // Second Esc: exit keyboard mode
            setKeyboardNavEnabled(false);
            setFocusedPhotoIndex(-1);
          }
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Select all photos
            setSelectedPhotos(new Set(currentPhotos.map(p => p.id)));
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Deselect all photos (Ctrl+D)
            setSelectedPhotos(new Set());
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          // Clear selection
          setSelectedPhotos(new Set());
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavEnabled, focusedPhotoIndex, getFilteredPhotos, togglePhotoSelection]);

  // Enable keyboard navigation when user starts typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!keyboardNavEnabled && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeyboardNavEnabled(true);
        setFocusedPhotoIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [keyboardNavEnabled]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [photosData, albumsData] = await Promise.all([
        getPhotos(),
        getAlbums()
      ]);
      setPhotos(photosData);
      setAlbums(albumsData);
      
      // Load album data for each photo
      const albumData: {[photoId: number]: Album[]} = {};
      for (const photo of photosData) {
        try {
          const photoAlbums = await getPhotoAlbums(photo.id);
          albumData[photo.id] = photoAlbums;
        } catch (err) {
          albumData[photo.id] = [];
        }
      }
      setPhotoAlbums(albumData);
      
      // Pre-load first few images to reduce initial flicker
      const firstFewImages = photosData.slice(0, 6).map(photo => photo.id);
      setLoadedImages(new Set(firstFewImages));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const data = await getPhotos();
      setPhotos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: 지원되지 않는 파일 형식`);
        continue;
      }
      
      if (file.size > maxSize) {
        errors.push(`${file.name}: 파일 크기가 10MB를 초과`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(`업로드 실패: ${errors.join(', ')}`);
      return;
    }

    if (validFiles.length === 0) {
      setError('업로드할 수 있는 파일이 없습니다.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Upload files sequentially to avoid overwhelming the server
      let uploadedCount = 0;
      for (const file of validFiles) {
        try {
          await uploadPhoto(file);
          uploadedCount++;
          setError(`업로드 중... ${uploadedCount}/${validFiles.length}장 완료`);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          errors.push(`${file.name}: 업로드 실패`);
        }
      }
      
      // Reload all data after uploads
      await loadData();
      
      // Clear file input
      event.target.value = '';
      
      // Show final result
      if (errors.length === 0) {
        setError(`${uploadedCount}장의 사진이 성공적으로 업로드되었습니다.`);
      } else {
        setError(`${uploadedCount}장 업로드 완료, ${errors.length}장 실패: ${errors.join(', ')}`);
      }
      
      setTimeout(() => setError(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getDisplayName = (photo: Photo) => {
    return photo.description || photo.original_name || photo.filename;
  };

  const getThumbnailUrl = (photo: Photo) => {
    // Use proxy path that gets rewritten to /data/photos/
    return `/photos/${photo.filename}`;
  };

  // LazyImage component with skeleton loading
  const LazyImage = ({ photo, isLoaded }: { photo: Photo; isLoaded: boolean }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(isLoaded);

    // Only start loading when isLoaded becomes true, and never revert
    useEffect(() => {
      if (isLoaded && !shouldLoad) {
        setShouldLoad(true);
      }
    }, [isLoaded, shouldLoad]);

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    return (
      <div style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative', backgroundColor: '#f9fafb', pointerEvents: 'none' }}>
        {/* Skeleton loader - only show when not loaded or loading */}
        {(!imageLoaded && shouldLoad && !imageError) && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}
        
        {/* Actual image - always render once shouldLoad is true */}
        {shouldLoad && (
          <img
            src={getThumbnailUrl(photo)}
            alt={getDisplayName(photo)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.2s ease',
              opacity: imageLoaded ? 1 : 0,
              position: 'relative',
              zIndex: 2,
              pointerEvents: 'none'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Placeholder when not loaded yet */}
        {!shouldLoad && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d1d5db',
              fontSize: '24px',
              pointerEvents: 'none'
            }}
          >
            📷
          </div>
        )}
        
        {/* Error state */}
        {imageError && shouldLoad && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '12px',
              textAlign: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 3,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
            <div>이미지를 불러올 수 없습니다</div>
          </div>
        )}
      </div>
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, photo: Photo) => {
    // Clear touch state to avoid conflicts
    setTouchDragPhoto(null);
    setIsTouchDragging(false);
    setTouchStartPos(null);
    
    // If current photo is part of selection, drag all selected photos
    if (selectedPhotos.has(photo.id) && selectedPhotos.size > 1) {
      setDraggedPhoto(photo); // Keep for UI feedback
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'multiple',
        photoIds: Array.from(selectedPhotos)
      }));
    } else {
      // Drag single photo
      setDraggedPhoto(photo);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'single',
        photoIds: [photo.id]
      }));
    }
  };

  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent, album: Album) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('text/plain');
    
    try {
      const parsedData = JSON.parse(dragData);
      const photoIds = parsedData.photoIds || [];
      
      if (photoIds.length === 0) return;

      // Add all photos to album
      await addPhotosToAlbum(album.id, photoIds);
      
      // Update photo albums cache for all photos
      for (const photoId of photoIds) {
        const updatedPhotoAlbums = await getPhotoAlbums(photoId);
        setPhotoAlbums(prev => ({
          ...prev,
          [photoId]: updatedPhotoAlbums
        }));
      }
      
      // Update album photo count
      const newPhotosCount = photoIds.filter(photoId => 
        !photoAlbums[photoId]?.some(a => a.id === album.id)
      ).length;
      
      if (newPhotosCount > 0) {
        setAlbums(prev => prev.map(a => 
          a.id === album.id 
            ? { ...a, photo_count: (a.photo_count || 0) + newPhotosCount }
            : a
        ));
      }
      
      const message = photoIds.length === 1 
        ? `"${draggedPhoto?.original_name}"을(를) "${album.name}" 앨범에 추가했습니다.`
        : `${photoIds.length}장의 사진을 "${album.name}" 앨범에 추가했습니다.`;
      
      setError(message);
      setTimeout(() => setError(null), 3000);
      
      // Clear selection after successful drop
      if (photoIds.length > 1) {
        setSelectedPhotos(new Set());
      }
    } catch (err) {
      // Fallback for old single photo format
      const photoId = parseInt(dragData);
      if (draggedPhoto && draggedPhoto.id === photoId) {
        await addPhotoToAlbum(draggedPhoto, album);
      }
    }
    
    setDraggedPhoto(null);
  };

  const addPhotoToAlbum = async (photo: Photo, album: Album) => {
    try {
      setError(null);
      await addPhotosToAlbum(album.id, [photo.id]);
      
      // Update photo albums cache
      const updatedPhotoAlbums = await getPhotoAlbums(photo.id);
      setPhotoAlbums(prev => ({
        ...prev,
        [photo.id]: updatedPhotoAlbums
      }));
      
      // Update album photo count in albums list only if photo wasn't already in the album
      const wasAlreadyInAlbum = photoAlbums[photo.id]?.some(a => a.id === album.id) || false;
      if (!wasAlreadyInAlbum) {
        setAlbums(prev => prev.map(a => 
          a.id === album.id 
            ? { ...a, photo_count: (a.photo_count || 0) + 1 }
            : a
        ));
      }
      
      setError(`"${photo.original_name}"을(를) "${album.name}" 앨범에 추가했습니다.`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add photo to album');
    }
  };

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, photo: Photo) => {
    console.log('Touch start on photo:', photo.id);
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchDragPhoto(photo);
    
    // Clear any existing drag state for clean start
    setDraggedPhoto(null);
    
    // Immediate haptic feedback on touch
    try {
      if ('vibrate' in navigator) {
        console.log('Triggering vibration...');
        navigator.vibrate(30);
      } else {
        console.log('Vibration not available');
      }
    } catch (err) {
      console.log('Vibration error:', err);
    }
    
    // Start dragging effect immediately for better responsiveness
    setTimeout(() => {
      console.log('Setting touch dragging to true');
      setIsTouchDragging(true);
    }, 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos || !touchDragPhoto) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // Start dragging if moved enough (10px threshold)
    if (!isTouchDragging && (deltaX > 10 || deltaY > 10)) {
      setIsTouchDragging(true);
      // CSS touchAction: 'none' handles scroll prevention
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } catch (err) {
        console.log('Move vibration error:', err);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging || !touchDragPhoto) {
      setTouchStartPos(null);
      setTouchDragPhoto(null);
      setIsTouchDragging(false);
      return;
    }

    // Find the element under the touch point
    const touch = e.changedTouches[0];
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    const albumElement = elementUnder?.closest('[data-album-drop]');
    
    if (albumElement) {
      const albumId = parseInt(albumElement.getAttribute('data-album-id') || '0');
      const album = albums.find(a => a.id === albumId);
      
      if (album) {
        addPhotoToAlbum(touchDragPhoto, album);
        // Haptic feedback for success
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 100]);
        }
      }
    }

    setTouchStartPos(null);
    setTouchDragPhoto(null);
    setIsTouchDragging(false);
  };


  const handleBulkAddToAlbum = async (albumId: number) => {
    if (selectedPhotos.size === 0) return;

    try {
      setError(null);
      await addPhotosToAlbum(albumId, Array.from(selectedPhotos));
      
      // Update photo albums cache for all selected photos
      for (const photoId of selectedPhotos) {
        const updatedPhotoAlbums = await getPhotoAlbums(photoId);
        setPhotoAlbums(prev => ({
          ...prev,
          [photoId]: updatedPhotoAlbums
        }));
      }
      
      // Count how many photos were actually new to the album
      let newPhotosCount = 0;
      for (const photoId of selectedPhotos) {
        const wasAlreadyInAlbum = photoAlbums[photoId]?.some(a => a.id === albumId) || false;
        if (!wasAlreadyInAlbum) {
          newPhotosCount++;
        }
      }
      
      // Update album photo count in albums list
      if (newPhotosCount > 0) {
        setAlbums(prev => prev.map(a => 
          a.id === albumId 
            ? { ...a, photo_count: (a.photo_count || 0) + newPhotosCount }
            : a
        ));
      }
      
      const album = albums.find(a => a.id === albumId);
      setError(`${selectedPhotos.size}장의 사진을 "${album?.name}" 앨범에 추가했습니다.`);
      setTimeout(() => setError(null), 3000);
      setSelectedPhotos(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add photos to album');
    }
  };

  const filteredPhotos = getFilteredPhotos();

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>
          가족 사진
        </h1>
        <div style={{ padding: '64px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
          <p style={{ color: '#6b7280' }}>사진을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          가족 사진
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '8px' }}>
          소중한 순간들을 함께 나눠요 ({filteredPhotos.length}/{photos.length}장)
        </p>
        
        {/* Keyboard Navigation Help */}
        {keyboardNavEnabled && (
          <div 
            role="status"
            aria-live="polite"
            style={{ 
              fontSize: '12px', 
              color: '#3b82f6', 
              backgroundColor: '#eff6ff',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #bfdbfe'
            }}
          >
            키보드 탐색: ↑↓←→ 이동 | Enter 모달열기 | Space 선택토글 | Ctrl+A 전체선택 | Ctrl+D/Del 선택해제 | Esc 해제/종료
          </div>
        )}
      </div>

      {/* Filter and Selection Controls */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Album Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filterAlbum || ''}
            onChange={(e) => setFilterAlbum(e.target.value ? parseInt(e.target.value) : null)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">모든 사진</option>
            {albums.map(album => (
              <option key={album.id} value={album.id}>
                {album.name} ({album.photo_count}장)
              </option>
            ))}
          </select>
          
          {selectedPhotos.size > 0 && (
            <>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {selectedPhotos.size}장 선택됨
              </span>
              
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAddToAlbum(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                <option value="">앨범에 추가</option>
                {albums.map(album => (
                  <option key={album.id} value={album.id} style={{ color: 'black' }}>
                    {album.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setSelectedPhotos(new Set())}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                선택 해제
              </button>
            </>
          )}
        </div>
      </div>

      {/* Album Drop Zones */}
      {albums.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 
            id="album-drop-zones-heading"
            style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}
          >
            앨범으로 드래그하세요
          </h3>
          <div 
            role="group"
            aria-labelledby="album-drop-zones-heading"
            style={{ 
              display: 'flex', 
              gap: '12px', 
              overflowX: 'auto',
              padding: '8px 0'
            }}
          >
            {albums.map(album => (
              <div
                key={album.id}
                data-album-drop="true"
                data-album-id={album.id}
                role="button"
                tabIndex={0}
                aria-label={`${album.name} 앨범에 사진 추가 (${album.photo_count || 0}장)`}
                aria-describedby={`album-${album.id}-description`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, album)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (draggedPhoto) {
                      addPhotoToAlbum(draggedPhoto, album);
                    }
                  }
                }}
                style={{
                  minWidth: '140px',
                  padding: '16px 12px',
                  backgroundColor: (draggedPhoto || isTouchDragging) ? '#f0f9ff' : 'white',
                  borderWidth: '2px',
                  borderStyle: 'dashed',
                  borderColor: (draggedPhoto || isTouchDragging) ? '#3b82f6' : '#d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isTouchDragging ? 'scale(1.05)' : 'scale(1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.backgroundColor = '#fffbeb';
                }}
                onBlur={(e) => {
                  if (!(draggedPhoto || isTouchDragging)) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📂</div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  {album.name}
                </div>
                <div 
                  id={`album-${album.id}-description`}
                  style={{ fontSize: '11px', color: '#6b7280' }}
                >
                  {album.photo_count || 0}장
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div 
        role="region"
        aria-labelledby="upload-section-heading"
        style={{ 
          marginBottom: '32px', 
          padding: '20px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            id="upload-section-heading"
            style={{ fontSize: '32px', marginBottom: '12px', display: 'none' }}
          >
            사진 업로드
          </div>
          <div style={{ fontSize: '32px', marginBottom: '12px' }} aria-hidden="true">📁</div>
          <label 
            htmlFor="photo-upload"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
                fileInput?.click();
              }
            }}
          >
            {uploading ? '업로드 중...' : '사진 업로드'}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
            aria-describedby="upload-description"
          />
          <p 
            id="upload-description"
            style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}
          >
            JPG, PNG, WEBP 파일 (최대 10MB) • 여러 파일 동시 선택 가능
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="photo-card"
              role="button"
              tabIndex={keyboardNavEnabled && focusedPhotoIndex === index ? 0 : -1}
              aria-label={`사진: ${getDisplayName(photo)}, ${formatDate(photo.uploaded_at)} 업로드${selectedPhotos.has(photo.id) ? ', 선택됨' : ''}`}
              aria-selected={selectedPhotos.has(photo.id)}
              aria-describedby={photoAlbums[photo.id]?.length > 0 ? `photo-albums-${photo.id}` : undefined}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, photo)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              ref={(el) => observePhotoElement(el, photo.id)}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: selectedPhotos.has(photo.id) 
                  ? '0 0 0 2px #3b82f6' 
                  : (keyboardNavEnabled && focusedPhotoIndex === index)
                    ? '0 0 0 2px #f59e0b, 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: (isTouchDragging && touchDragPhoto?.id === photo.id) ? 1 : 
                         (draggedPhoto?.id === photo.id) ? 0.5 : 1,
                position: 'relative',
                transform: (isTouchDragging && touchDragPhoto?.id === photo.id) ? 'rotate(5deg) scale(0.95)' : 
                          (draggedPhoto?.id === photo.id) ? 'scale(0.95)' : 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
                outline: 'none' // Remove default focus outline as we use custom styling
              }}
              onClick={(e) => {
                setKeyboardNavEnabled(false);
                setFocusedPhotoIndex(-1);
                
                if (isTouchDragging) {
                  return;
                }
                
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  togglePhotoSelection(photo.id);
                } else {
                  setSelectedPhoto(photo);
                }
              }}
              onFocus={() => {
                setKeyboardNavEnabled(true);
                setFocusedPhotoIndex(index);
              }}
              onMouseEnter={(e) => {
                if (!selectedPhotos.has(photo.id) && !(keyboardNavEnabled && focusedPhotoIndex === index)) {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if (!selectedPhotos.has(photo.id) && !(keyboardNavEnabled && focusedPhotoIndex === index)) {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1)';
              }}
            >
              {/* Selection Checkbox */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 10,
                  width: '20px',
                  height: '20px',
                  backgroundColor: selectedPhotos.has(photo.id) ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid #3b82f6',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePhotoSelection(photo.id);
                }}
              >
                {selectedPhotos.has(photo.id) && (
                  <span style={{ color: 'white', fontSize: '12px', pointerEvents: 'none' }}>✓</span>
                )}
              </div>

              {/* Touch Drag Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  zIndex: 5,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '6px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  opacity: (draggedPhoto?.id === photo.id || (isTouchDragging && touchDragPhoto?.id === photo.id)) ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none'
                }}
              >
                {selectedPhotos.has(photo.id) && selectedPhotos.size > 1
                  ? `${selectedPhotos.size}장 드래그`
                  : isTouchDragging && touchDragPhoto?.id === photo.id 
                    ? '앨범으로 드롭하세요' 
                    : '터치 앤 드래그'
                }
              </div>
              
              {/* Mobile Long Press Hint */}
              {!isTouchDragging && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    zIndex: 5,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '9px',
                    fontWeight: '500',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none'
                  }}
                  className="mobile-hint"
                >
                  길게 눌러 드래그
                </div>
              )}

              <LazyImage 
                photo={photo}
                isLoaded={loadedImages.has(photo.id)}
              />
              
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', margin: 0 }}>
                  {getDisplayName(photo)}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {formatDate(photo.uploaded_at)}
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                  {(photo.file_size / 1024).toFixed(1)} KB
                </p>
                
                {/* Photo Albums */}
                {photoAlbums[photo.id] && photoAlbums[photo.id].length > 0 && (
                  <div id={`photo-albums-${photo.id}`} style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                      앨범:
                    </div>
                    <div 
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}
                      role="list"
                      aria-label="포함된 앨범 목록"
                    >
                      {photoAlbums[photo.id].map(album => (
                        <span
                          key={album.id}
                          role="listitem"
                          style={{
                            fontSize: '10px',
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            padding: '2px 6px',
                            borderRadius: '12px'
                          }}
                        >
                          {album.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📸</span>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            아직 사진이 없어요
          </h3>
          <p style={{ color: '#9ca3af' }}>
            첫 번째 가족 사진을 업로드해보세요!
          </p>
        </div>
      )}

      {/* Modal for Selected Photo */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-modal-title"
          aria-describedby="photo-modal-description"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}
          onClick={() => setSelectedPhoto(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelectedPhoto(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h2 
                  id="photo-modal-title"
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '4px'
                  }}
                >
                  {getDisplayName(selectedPhoto)}
                </h2>
                <p 
                  id="photo-modal-description"
                  style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}
                >
                  {formatDate(selectedPhoto.uploaded_at)} • {(selectedPhoto.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                aria-label="사진 상세보기 닫기"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPhoto(null);
                  }
                }}
              >
                ×
              </button>
            </div>
            
            {/* Image */}
            <div style={{ padding: '16px' }}>
              <img
                src={getThumbnailUrl(selectedPhoto)}
                alt={getDisplayName(selectedPhoto)}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
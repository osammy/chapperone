import {Platform} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {generateRandomStrings} from '.';

export const pickMultiple = options => {
  // const options = {
  //     multiple: true,
  //     waitAnimationEnd: false,
  //     // includeExif: true,
  //     forceJpg: true,
  //     mediaType: 'photo',
  //   }
  return new Promise((resolve, reject) => {
    const isIos = Platform.OS === 'ios';

    ImagePicker.openPicker({
      ...options,
      multiple: true,
      mediaType: 'photo',
      waitAnimationEnd: false,
    })
      .then(imageData => {
        const formattedImagesData = imageData.map(i => {
          // This unique string is needed because i noticed firebase replaced, images which had the same filename
          const uniqueString = generateRandomStrings(5);
          const uri = isIos ? i.uri : i.path;
          const filename = isIos
            ? `${uniqueString}-${i.filename} `
            : `${uniqueString}-${uri.replace(/^.*[\\\/]/, '')}`;

          return {
            uri,
            width: i.width,
            height: i.height,
            mime: i.mime,
            size: i.size,
            filename,
          };
        });

        resolve(formattedImagesData);
      })
      .catch(reject);
  });
};
export const pickSingleImage = async options => {
  // const options = {
  //   multiple: true,
  //   mediaType: 'photo',
  // };

  const isIos = Platform.OS === 'ios';

  const image = await ImagePicker.openPicker({...options, mediaType: 'photo'});
  const uniqueString = generateRandomStrings(5);
  const uri = image.path;

  // const uri = isIos ? image.uri : image.path;
  const filename = isIos
    ? `${uniqueString}-${image.filename}`
    : `${uniqueString}-${uri.replace(/^.*[\\\/]/, '')}`;

  return {
    uri,
    width: image.width,
    height: image.height,
    mime: image.mime,
    size: image.size,
    filename,
  };
};

export const validateImages = (images, options) => {
  if (!Array.isArray(images)) {
    images = [images];
  }
  const {max_size_per_image, max_no_of_images, total_images_size} = options;
  const optionsInvalid =
    !max_size_per_image || !max_no_of_images || !total_images_size || !images;

  if (optionsInvalid) {
    return {
      error: true,
      images: [],
      message: 'One or more image validation options are missing',
    };
  }
  // const max_size_per_image = 6 * 1024 * 1024; // 6mb is max iage size per image
  // const max_no_of_images = 6;
  // const total_images_size = 10 * 1024 * 1024; // max sum of all the sizes of images to be uploaded
  const copyOfImages = [...images];
  let total = 0;

  if (images.length > max_no_of_images) {
    return {
      error: true,
      images: [],
      message: `Image(s) must not exceed ${max_no_of_images} in number.`,
    };
  }
  for (let i = 0; i < copyOfImages.length; i++) {
    if (copyOfImages[i].size > max_size_per_image * 1024 * 1024) {
      return {
        error: true,
        images: [],
        message: `Each image size must not exceed ${max_size_per_image}mb`,
      };
    }

    total += copyOfImages[i].size;
  }

  if (total > total_images_size * 1024 * 1024) {
    return {
      error: true,
      images: [],
      message: `Total sum of all Image(s) size must not exceed ${total_images_size}mb`,
    };
  }

  return {
    error: false,
    images: copyOfImages,
    message: 'Success',
  };
};

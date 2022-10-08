package functions

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

// Checks whether the uploaded file is one of the correct file types.
func okContentType(contentType string) (bool, error) {
	if contentType == "image/png" || contentType == "image/jpeg" || contentType == "image/gif" {
		return true, nil
	} else {
		return false, errors.New(fmt.Sprintf("Incorrect file type: %s", contentType))
	}
}

func UploadFile(w http.ResponseWriter, r *http.Request) string {
	if r.Method == "POST" {
		// Limits the uploaded file to 20mb.
		r.ParseMultipartForm(20 << 20)

		// Grabs the data from the form submition.
		file, handler, err := r.FormFile("file-upload")
		if err != nil {
			return ""
		}
		defer file.Close()

		// Stores and checks the type of file uploaded.
		contentType := handler.Header.Get("content-type")

		_, err = okContentType(contentType)
		if err != nil {
			CheckErr(err)
			return ""
		}

		// Stores the file extention.
		ind := strings.Index(contentType, "/") + 1

		fileExtention := contentType[ind:]

		// Creates the temporary file that will store the uploaded image.
		tempFile, err := ioutil.TempFile("images", fmt.Sprintf("image-*.%s", fileExtention))
		if err != nil {
			// CheckErr(err)
			return ""
		}
		defer tempFile.Close()

		// Writes the image data to the temporary file.
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			CheckErr(err)
			return ""
		}
		tempFile.Write(fileBytes)

		// Returns the path to the image.
		return tempFile.Name()
	}
	return ""
}

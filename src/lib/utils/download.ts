/**
 * Safe download utility to prevent DOM-based XSS (Programmatic Download Sink)
 * and ensure filenames are sanitized.
 */
export const safeDownload = (blob: Blob, fileName: string) => {
    // 1. Sanitize the filename to remove potential XSS vectors or path traversal characters
    // Replace anything that isn't alphanumeric, space, dot, underscore, or hyphen
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9\s._-]/g, '_');

    // 2. Create the URL
    const url = window.URL.createObjectURL(blob);

    // 3. Create a hidden anchor element
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;

    // 4. Set the download attribute with the sanitized name
    link.setAttribute('download', sanitizedName);

    // 5. Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();

    // 6. Final cleanup
    setTimeout(() => {
        if (document.body.contains(link)) {
            document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
    }, 100);
};

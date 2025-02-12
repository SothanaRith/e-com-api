const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

exports.convertVideoToGif = async (req, res) => {
    const outputPath = path.join('uploads', `${Date.now()}.gif`);
    const { filename } = req.params;
      ffmpeg(filename)
        .output(outputPath)
        .noAudio()
        .size('640x?')
        .outputOptions('-pix_fmt', 'rgb24')
        .on('end', () => {
          // Delete the input video after conversion
          fs.unlinkSync(filename);
    
          // Respond with the path to the generated GIF
          res.json({ gif_url: `http://your-backend-url/${outputPath}` });
        })
        .on('error', (err) => {
          console.error(err);
          res.status(500).send('Error converting video to GIF');
        })
        .run();
  }


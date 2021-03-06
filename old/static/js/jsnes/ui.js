/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

JSNES.DummyUI = function(nes) {
    this.nes = nes;
    this.enable = function() {};
    this.loadROM = function() {};
    this.updateStatus = function() {};
    this.writeAudio = function() {};
    this.writeFrame = function() {};
};

if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.JSNESUI = function() {
            var parent = this;
            var UI = function(nes) {
                var self = this;
                self.nes = nes;
                
                /*
                 * Create UI
                 */
                self.root = $('<div></div>');
                self.screen = $('<canvas class="nes-screen" id="canvas" tabindex="0" width="256" height="240"></canvas>').appendTo(self.root);
                
                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.status = $('<p class="nes-status" id="nes-status">Booting up...</p>').appendTo(self.root);
                self.root.appendTo(parent);
        
                /*
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
                if ($.offset) {
                    self.screen.mousedown(function(e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function() {
                        setTimeout(function() {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }

                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');
                
                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                
                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();
            
                /*
                 * Keyboard
                 */
                $(document).
                    bind('keydown', function(evt) {
                        self.nes.keyboard.keyDown(evt); 
                    }).
                    bind('keyup', function(evt) {
                        self.nes.keyboard.keyUp(evt); 
                    });
            
                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath+'dynamicaudio.swf'
                });
            };
        
            UI.prototype = {
                resetCanvas: function() {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },
                
                /*
                *
                * nes.ui.screenshot() --> return <img> element :)
                */
                screenshot: function() {
                    var data = this.screen[0].toDataURL("image/png"),
                        img = new Image();
                    img.src = data;
                    return img;
                },
            
                updateStatus: function(s) {
                    this.status.text(s);
                },
            
                writeAudio: function(samples) {
                    if (typeof(RoomPlayerNO)!="undefined" && typeof(dataChannel)!="undefined") {
                        if ( RoomPlayerNO==1 && dataChannel.readyState=="open" ) {
                            dataChannel.send(samples);
                        }
                    }
                    return this.dynamicaudio.writeInt(samples);
                },
            
                writeFrame: function(buffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;
                    for (i=8;i<232;i++)
                        for(j=8;j<248;j++) {
                            var index = (i<<8)+j;
                            pixel = buffer[index];
                            index = index<<2;
                            imageData[index] = pixel & 0xFF; // r
                            imageData[index+1] = (pixel >> 8) & 0xFF; // g
                            imageData[index+2] = (pixel >> 16) & 0xFF; // b
                        }
                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                },
                // writeScanline: function(buffer, y) {
                //     var imageData = this.canvasImageData.data;
                //     var pixel, i, j, start;
                //     start = 256*y;
                //     for (i=0; i<256; i++) {
                //         pixel = buffer[i+start];
                //         j = i*4;
                //         imageData[j] = pixel & 0xFF;
                //         imageData[j+1] = (pixel >> 8) & 0xFF;
                //         imageData[j+2] = (pixel >> 16) & 0xFF;
                //     }
                //     this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                // }
            };
        
            return UI;
        };
    })(jQuery);
}

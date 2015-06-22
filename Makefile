
all:
	grunt build_B
	grunt
#cd utils && node build_gui.js

clean:
	-rm build/*.js

.PHONY: all clean


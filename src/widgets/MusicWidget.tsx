import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

export function MusicWidget({ 
  title = 'Esei Tase', 
  artist = 'Ready to play', 
  isPlaying = false, 
  artUri = '' 
}) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0A0A',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#1F1F1F',
      }}
    >
      {/* Dynamic Album Art */}
      <ImageWidget
        image={artUri || require('../../assets/adaptive-icon.png')}
        imageWidth={54}
        imageHeight={54}
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
        }}
      />

      {/* Text Info */}
      <FlexWidget
        style={{
          flex: 1,
          marginLeft: 16,
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={title}
          style={{
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text={artist}
          style={{
            color: '#A0A0A0',
            fontSize: 12,
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Playback Controls */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <FlexWidget
          style={{
             padding: 8,
             borderRadius: 20,
             backgroundColor: '#1A1A1A',
             width: 40,
             height: 40,
             alignItems: 'center',
             justifyContent: 'center',
             marginRight: 8,
          }}
          clickAction="PREV"
        >
          <TextWidget text="⏮" style={{ color: '#FFFFFF', fontSize: 16 }} />
        </FlexWidget>

        <FlexWidget
          style={{
             padding: 8,
             borderRadius: 24,
             backgroundColor: '#FFFFFF',
             alignItems: 'center',
             justifyContent: 'center',
             width: 44,
             height: 44,
             marginRight: 8,
          }}
          clickAction={isPlaying ? 'PAUSE' : 'PLAY'}
        >
          <TextWidget 
            text={isPlaying ? "⏸" : "▶"} 
            style={{ color: '#000000', fontSize: 18 }} 
          />
        </FlexWidget>

        <FlexWidget
          style={{
             padding: 8,
             borderRadius: 20,
             backgroundColor: '#1A1A1A',
             width: 40,
             height: 40,
             alignItems: 'center',
             justifyContent: 'center',
          }}
          clickAction="NEXT"
        >
          <TextWidget text="⏭" style={{ color: '#FFFFFF', fontSize: 16 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}


# Aii App — Krok po Kroku: Setup + Routing + UI

## 1. Obsługa inputu i dialogu (echo logika)
- Stwórz stan (`useState`) do przechowywania wiadomości.
- Dodaj `onChange` i `onSubmit` do formularza.
- Przechwyć wpisaną wiadomość, zapisz do listy.
- Opcjonalnie: wygeneruj odpowiedź Aii (np. echo + delay).

## 2. Routing do wielu „pokojów” (ścieżek)
- Zainstaluj `react-router-dom`: `npm install react-router-dom`
- Ustaw `BrowserRouter`, `Routes`, `Route` w `App.jsx`.
- Utwórz komponenty pokoi np. `RoomCichosc`, `RoomEcho`, `RoomMain`.
- Przykład ścieżki: `/room/:id`

## 3. Podział na komponenty
- Stwórz pliki w `src/components`:
  - `Message.jsx` — pojedyncza wiadomość
  - `InputBox.jsx` — input + przycisk
  - `Room.jsx` — kontener pokoju
- Przekazuj propsy: `onSend`, `messages`, `roomName` itd.

## 4. Wersja mobilna + style
- Zainstaluj Tailwinda (lub użyj CSS Modules / styled-components).
- Przygotuj responsywny layout z flex/grid.
- Przykład: input przyklejony do dołu ekranu, wiadomości przewijalne.

🎁 Gotowe! To baza pod rozszerzanie: backend, AI, pamięć rozmowy itd.

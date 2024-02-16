package main

import (
	"fmt"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"github.com/golang/glog"
	"github.com/sqweek/dialog"
	"os"
)

func getExtractionMessage(p string) string {
	return fmt.Sprintf("extrcat to %s", p)
}

func isGui() bool {
	return len(os.Args) == 1
}

func gui() {
	a := app.New()
	w := a.NewWindow("RPA extractor")
	hello := widget.NewLabel("Choose RPA file and extraction directory!")

	var err error
	var rpaPath string
	var extraction = defaultExtractionPath

	var chooseRpa *widget.Button
	chooseRpa = widget.NewButton("Which file to extract?", func() {
		rpaPath, err = dialog.File().Filter("RPA files", "rpa").Title("Extract RPA").Save()
		if err != nil {
			glog.Exit(err)
		}
		chooseRpa.SetText(fmt.Sprintf("extract RPA %s", rpaPath))
	})

	var chooseExtract *widget.Button
	chooseExtract = widget.NewButton(getExtractionMessage(defaultExtractionPath), func() {
		extraction, err = dialog.Directory().Title("Where to extract").Browse()
		if err != nil {
			glog.Exit(err)
		}
		chooseExtract.SetText(getExtractionMessage(extraction))

	})

	start := widget.NewButton("start", func() {
		run(rpaPath, extraction)

	})

	w.SetContent(container.NewVBox(
		hello,
		chooseRpa,
		chooseExtract,
		start,
	))

	w.ShowAndRun()

}
